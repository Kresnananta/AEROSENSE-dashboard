import test from "node:test";
import assert from "node:assert/strict";
import { parseDisasterFeed, disasterNews, NEWS_SOURCES } from "../api/disaster-news.mjs";
const now = Date.parse("2026-10-18T06:00:00Z");
const at = new Date(now - 3600000).toUTCString();
const rss = (items) => `<rss xmlns:gdacs="https://www.gdacs.org"><channel>${items}</channel></rss>`;
const item = (country = "IDN", date = at, link = "https://www.gdacs.org/report.aspx?eventid=1") =>
  `<item><title>Forest fire notification in Indonesia</title><link>${link}</link><pubDate>${date}</pubDate><gdacs:iso3>${country}</gdacs:iso3><gdacs:eventtype>WF</gdacs:eventtype><gdacs:severity unit="ha" value="6500">6500 ha</gdacs:severity><gdacs:population value="9000">9000</gdacs:population></item>`;

test("disaster feed keeps recent Indonesia events and distinguishes model area from confirmed impact", () => {
  const xml = rss(
    item() +
      item("MYS") +
      item("IDN", new Date(now - 8 * 86400000).toUTCString()) +
      item("IDN", new Date(now + 86400000).toUTCString()) +
      item("IDN", at, "javascript:alert(1)"),
  );
  const result = parseDisasterFeed(xml, NEWS_SOURCES[0], now);
  assert.equal(result.length, 1);
  assert.equal(result[0].country_code, "IDN");
  assert.equal(result[0].kind, "monitoring");
  assert.deepEqual(result[0].metrics, [{ value: 6500, unit: "ha", label: "Estimasi area GDACS" }]);
  assert(!JSON.stringify(result).includes("9000"));
  assert.throws(() =>
    parseDisasterFeed('<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>', NEWS_SOURCES[0], now),
  );
  assert.throws(() => parseDisasterFeed("<rss><channel></rss>", NEWS_SOURCES[0], now));
});

test("GDACS upgrades official RSS links and passes only supported map enclosures", () => {
  const map = "https://www.gdacs.org/contentdata/resources/imgtemp/gdacs/fl/dfo2026_1104253.png";
  const link = "http://www.gdacs.org/report.aspx?eventtype=FL&amp;eventid=1577920";
  const event = item("IDN", at, link).replace(">WF<", ">FL<");
  const withImage = (url) => event.replace("</item>", "<enclosure type=\"image/png\" url=\"" + url + "\"/></item>");
  const [official] = parseDisasterFeed(rss(withImage(map)), NEWS_SOURCES[0], now);
  assert.equal(official.url, "https://www.gdacs.org/report.aspx?eventtype=FL&eventid=1577920");
  assert.equal(official.map_url, map);
  for (const invalid of [map.replace("www.gdacs.org", "example.org"), "https://www.gdacs.org/images/gdacs-icon.png"]) {
    const [article] = parseDisasterFeed(rss(withImage(invalid)), NEWS_SOURCES[0], now);
    assert.equal(article.map_url, null);
  }
});

test("GDACS earthquakes and legacy quake cache entries are omitted", async () => {
  const quake = item().replace(">WF<", ">EQ<");
  assert.deepEqual(parseDisasterFeed(rss(quake), NEWS_SOURCES[0], now), []);
  const legacy = { type: "Gempa", country_code: "IDN", published_at: new Date(now).toISOString(),
    url: "https://www.gdacs.org/report.aspx?eventtype=EQ&eventid=2" };
  const cached = NEWS_SOURCES.map((source, index) => ({
    provider: source.id,
    refresh_after: new Date(now + 60_000).toISOString(),
    last_success_at: new Date(now).toISOString(),
    items: index === 0 ? [legacy, ...parseDisasterFeed(rss(item()), source, now)] : [],
  }));
  const response = await disasterNews({ db: async () => cached, clock: () => now }).read();
  assert.deepEqual(response.items.map(({ type }) => type), ["Karhutla"]);
});

test("the disaster list keeps GDACS visible when ANTARA fills the page limit", async () => {
  const sources = NEWS_SOURCES.map((source, index) => ({
    provider: source.id,
    refresh_after: new Date(now + 60_000).toISOString(),
    last_success_at: new Date(now).toISOString(),
    items: index === 0 ? parseDisasterFeed(rss(item()), source, now) : Array.from({ length: 30 }, (_, i) => ({
      url: "https://www.antaranews.com/berita/" + i, country_code: "IDN", published_at: new Date(now).toISOString(), kind: "news",
    })),
  }));
  const response = await disasterNews({ db: async () => sources, clock: () => now }).read();
  assert.equal(response.items.length, 24);
  assert.equal(response.items.at(-1).source, "GDACS");
});

test("ANTARA excludes earthquake coverage, foreign and unrelated headlines", () => {
  const xml = rss(
    [
      "Banjir di Surabaya mulai surut",
      "Gempa M6,8 di Maluku Barat Daya",
      "Banjir di India memburuk",
      "Banjir meluas di sejumlah wilayah",
      "Cuaca ekstrem di Australia dan Indonesia",
      "Belajar kompos di Surabaya",
    ]
      .map(
        (title, i) =>
          `<item><title>${title}</title><pubDate>${at}</pubDate><link>https://www.antaranews.com/berita/${i}</link></item>`,
      )
      .join(""),
  );
  const result = parseDisasterFeed(xml, NEWS_SOURCES[1], now);
  assert.equal(result.length, 1);
  assert.equal(result[0].location, "Surabaya");
});

test("recognized Indonesian regional fire headlines are not dropped", () => {
  const title = "BPBD Hulu Sungai Selatan Tangani Karhutla di Lahan Warga";
  const result = parseDisasterFeed(
    rss(
      `<item><title>${title}</title><pubDate>${at}</pubDate><link>https://www.antaranews.com/berita/1</link></item>`,
    ),
    NEWS_SOURCES[2],
    now,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].type, "Karhutla");
});

test("successful short RSS updates retain recent cached reports and outages remain explicit", async () => {
  let rows = [],
    time = now,
    empty = false,
    offline = false;
  const news = disasterNews({
    clock: () => time,
    db: async (_t, _q, method, body) => {
      if (method === "POST") {
        rows = rows.filter((r) => r.provider !== body.provider).concat(body);
        return;
      }
      return structuredClone(rows);
    },
    fetcher: async (url) => {
      if (offline) throw Error("offline");
      return new Response(rss(!empty && url.includes("gdacs") ? item() : ""));
    },
  });
  await news.refresh();
  empty = true;
  time += 20 * 60000;
  await news.refresh();
  assert.equal((await news.read()).items.length, 1);
  time += 8 * 86400000;
  offline = true;
  const unavailable = await news.read();
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.items.length, 0);
  assert(unavailable.sources.every((s) => s.error));
});

test("shared refresh coalesces visitors, deduplicates links and keeps last success during outages", async () => {
  let rows = [],
    calls = 0,
    time = now,
    fail = false;
  const db = async (_table, _q, method, body) => {
    if (method === "POST") {
      rows = rows.filter((r) => r.provider !== body.provider).concat(body);
      return null;
    }
    return structuredClone(rows);
  };
  const news = disasterNews({
    db,
    clock: () => time,
    fetcher: async (url) => {
      calls++;
      if (fail) throw Error("offline");
      return new Response(url.includes("gdacs") ? rss(item() + item()) : rss(""));
    },
  });
  await Promise.all([news.refresh(), news.refresh(), news.refresh()]);
  assert.equal(calls, 3);
  assert.equal((await news.read()).items.length, 1);
  await news.refresh();
  assert.equal(calls, 3);
  time += 2 * 3600000;
  fail = true;
  await news.refresh();
  const stale = await news.read();
  assert.equal(stale.items.length, 1);
  assert.equal(stale.items[0].stale, true);
  assert(stale.sources.every((s) => s.error));
  time += 8 * 86400000;
  assert.deepEqual((await news.read()).items, []);
});
