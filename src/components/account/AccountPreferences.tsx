import { useState, type FormEvent } from "react";
import { useLiveData } from "@/hooks/useLiveData";
import { ROLE_LABELS, type AccessRole } from "@/hooks/useAccess";
import { api, apiRequest } from "@/services/api";
import { DataState } from "@/components/shared/DataState";

type Profile = { full_name: string | null; organization: string | null; phone: string | null; address: string | null };
type Me = { profile: Profile | null; is_staff: boolean; memberships: { role: AccessRole }[] };
type Member = { user_id: string; name: string; role: AccessRole; editable: boolean };
type MemberList = { locations: { id: string; name: string }[]; members: Member[] };
const roles = ["viewer", "robot", "operator", "auditor"] as const;

export function AccountPreferences() {
  const me = useLiveData<Me>("/v1/me", 300_000);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setError("");
    try {
      await api.patch("/v1/me/profile", Object.fromEntries(new FormData(event.currentTarget)));
      setStatus("Profil tersimpan.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Profil belum tersimpan.");
    } finally {
      setBusy(false);
    }
  }
  if (!me.data) return <DataState loading={me.loading} error={me.error} retry={me.refresh} />;
  const { profile, is_staff } = me.data;
  return (
    <>
      <section className="live-panel settings-editor" aria-labelledby="profile-title">
        <h2 id="profile-title">Profil</h2>
        <form className="settings-form" onSubmit={save}>
          <fieldset disabled={busy}>
            <label>Nama lengkap<input name="full_name" defaultValue={profile?.full_name ?? ""} autoComplete="name" maxLength={80} /></label>
            <label>Instansi<input name="organization" defaultValue={profile?.organization ?? ""} autoComplete="organization" maxLength={120} /></label>
            <label>Nomor telepon<input name="phone" type="tel" defaultValue={profile?.phone ?? ""} autoComplete="tel" maxLength={24} /></label>
            <label>Alamat<input name="address" defaultValue={profile?.address ?? ""} autoComplete="street-address" maxLength={240} /></label>
          </fieldset>
          <button className="live-button" disabled={busy}>{busy ? "Menyimpan…" : "Simpan profil"}</button>
          {status && <p role="status">{status}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
      {(is_staff || me.data.memberships.some((membership) => membership.role === "admin")) && <LocationMembers />}
    </>
  );
}

function LocationMembers() {
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const list = useLiveData<MemberList>("/v1/staff/members?location=" + encodeURIComponent(location), 60_000);

  async function save(event: FormEvent<HTMLFormElement>, member: Member) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const role = String(data.get("role"));
    if (role === member.role || (!role && !window.confirm("Cabut akses " + member.name + " dari kawasan ini?"))) return;
    setBusy(true);
    setStatus("");
    setError("");
    try {
      await apiRequest("/v1/staff/members", {
        method: role ? "PATCH" : "DELETE",
        body: JSON.stringify({ user_id: member.user_id, location_id: location, current_role: member.role, role }),
      });
      setStatus(role ? "Peran anggota diperbarui." : "Akses anggota dicabut.");
      list.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Akses belum berubah.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="live-panel settings-editor" aria-labelledby="members-title">
      <h2 id="members-title">Akses kawasan</h2>
      <div className="settings-form">
        <label>Kawasan
          <select value={location} disabled={busy} onChange={(event) => {
            setLocation(event.target.value);
            setError("");
            setStatus("");
          }}>
            <option value="">Pilih kawasan</option>
            {list.data?.locations.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.id}</option>)}
          </select>
        </label>
        {status && <p role="status">{status}</p>}
        {error && <p role="alert">{error}</p>}
        {list.error && <DataState error={list.error} retry={list.refresh} />}
        {location && !list.error && (list.loading ? <p>Memuat anggota…</p> : !list.data?.members.length ? <p>Belum ada anggota di kawasan ini.</p> :
          <ul className="settings-members">
            {list.data.members.map((member) => (
              <li key={member.user_id}>
                <strong>{member.name}</strong>
                {member.editable ? (
                  <form key={member.role} onSubmit={(event) => void save(event, member)}>
                    <label className="sr-only" htmlFor={"member-" + member.user_id}>Akses {member.name}</label>
                    <select id={"member-" + member.user_id} name="role" defaultValue={member.role} disabled={busy}>
                      {roles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                      <option value="">Cabut akses kawasan</option>
                    </select>
                    <button className="live-button secondary" disabled={busy}>Simpan akses</button>
                  </form>
                ) : <span>{ROLE_LABELS[member.role]}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
