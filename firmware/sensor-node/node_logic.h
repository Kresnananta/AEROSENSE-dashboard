#pragma once
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum class Level { Unknown, Good, Warning, Danger };
enum class Link { Waiting, Sent, Good, Weak, Lost };

struct Sample {
  float dust = NAN;
  float eco2 = NAN, tvoc = NAN;
  float temperature = NAN, humidity = NAN;
  bool sgpWarming = false;
};

inline float sharpDust(float sensorVolts, float zeroVolts, float ugPerVolt = 200.0f) {
  if (isnan(sensorVolts)) return NAN;
  float ug = (sensorVolts - zeroVolts) * ugPerVolt;
  return ug < 0 ? 0 : ug;
}

inline Level levelFor(float value, float high, float danger) {
  if (isnan(value)) return Level::Unknown;
  if (value >= danger) return Level::Danger;
  if (value >= high) return Level::Warning;
  return Level::Good;
}

inline int csvLine(char* out, size_t size, const char* nodeId, uint32_t counter, const Sample& s) {
  auto put = [](char* b, size_t n, float v, int d) { if (isnan(v)) snprintf(b, n, "nan"); else snprintf(b, n, "%.*f", d, v); };
  char t[16], e[16], v[16], d[16], h[16];
  put(t, sizeof t, s.temperature, 1); put(e, sizeof e, s.eco2, 0); put(v, sizeof v, s.tvoc, 0);
  put(d, sizeof d, s.dust, 1); put(h, sizeof h, s.humidity, 1);
  return snprintf(out, size, "%s,%lu,%s,%s,%s,%s,%s\n", nodeId, static_cast<unsigned long>(counter), t, e, v, d, h);
}

inline bool parseAck(const char* line, const char* nodeId, uint32_t counter, int& rssi, bool& hasRssi) {
  if (strncmp(line, "ACK,", 4) != 0) return false;
  const char* p = line + 4;
  size_t idLen = strlen(nodeId);
  if (strncmp(p, nodeId, idLen) != 0 || p[idLen] != ',') return false;
  p += idLen + 1;
  char* end = nullptr;
  unsigned long got = strtoul(p, &end, 10);
  if (end == p || got != counter) return false;
  hasRssi = false;
  if (*end == ',') {
    char* rend = nullptr;
    long value = strtol(end + 1, &rend, 10);
    if (rend != end + 1 && value < 0 && value > -150) { rssi = static_cast<int>(value); hasRssi = true; }
  }
  return true;
}

struct LinkState {
  Link state = Link::Waiting;
  int rssi = 0;
  bool hasRssi = false;
  uint8_t misses = 0;

  void sent(bool ackMode) { if (!ackMode) state = Link::Sent; }
  void acked(int value, bool withRssi, int weakBelow) {
    misses = 0;
    hasRssi = withRssi;
    rssi = value;
    state = withRssi && value < weakBelow ? Link::Weak : Link::Good;
  }
  void timedOut(uint8_t lostAfter) {
    if (misses < 255) misses++;
    if (misses >= lostAfter) state = Link::Lost;
    else if (state == Link::Good) state = Link::Weak;
  }
};
