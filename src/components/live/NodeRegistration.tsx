import { useState, type FormEvent } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useLiveData } from "@/hooks/useLiveData";
import { api } from "@/services/api";
import { MonitoringSelect } from "@/components/shared/MonitoringSelect";
import "./node-registration.css";

type Registration = {
  locations: { id: string; name: string; can_publish: boolean }[];
  gateways: string[];
};

export function NodeRegistration({ onCreated }: { onCreated: (id: string) => void }) {
  const registration = useLiveData<Registration>("/v1/nodes/registration", 60000);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [location, setLocation] = useState("");
  const [gateway, setGateway] = useState("");
  const locations = registration.data?.locations || [];
  const locationId = location || locations[0]?.id || "";
  const gatewayId = gateway || registration.data?.gateways[0] || "";
  const canPublish = locations.find((l) => l.id === locationId)?.can_publish;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { node } = await api.post<{ node: { id: string; name: string } }>("/v1/nodes", {
        id: String(fields.get("id")).trim(),
        name: String(fields.get("name")).trim(),
        latitude: Number(fields.get("latitude")),
        longitude: Number(fields.get("longitude")),
        location_id: locationId,
        gateway_id: gatewayId,
        public_read: canPublish === true && fields.get("public_read") === "on",
      });
      form.reset();
      setOpen(false);
      setNotice(`${node.name} berhasil ditambahkan. Menunggu pembacaan dari gateway.`);
      onCreated(node.id);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Node belum dapat ditambahkan.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="node-registration">
      <button
        className="btn-primary"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Plus size={17} /> Tambah node
      </button>
      {notice && <p role="status">{notice}</p>}
      {open && (
        <form onSubmit={submit} className="node-registration-form">
          <div>
            <h3>Tambah node sensor</h3>
            <p>Daftarkan perangkat pada lokasi yang Anda kelola.</p>
          </div>
          {registration.error && <p role="alert">{registration.error}</p>}
          <div className="node-registration-fields">
            <label>
              Nama node
              <input
                name="name"
                required
                maxLength={100}
                placeholder="Contoh: Sensor Gerbang Timur"
              />
            </label>
            <label>
              ID perangkat
              <input
                name="id"
                required
                pattern="[a-zA-Z0-9_-]{1,40}"
                maxLength={40}
                placeholder="Sesuai ID pada firmware"
              />
            </label>
            <label>
              Lokasi penugasan
              <MonitoringSelect
                label="Lokasi penugasan"
                value={locationId}
                onValueChange={setLocation}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </label>
            <label>
              Gateway
              <MonitoringSelect
                label="Gateway"
                value={gatewayId}
                onValueChange={setGateway}
                options={(registration.data?.gateways || []).map((id) => ({
                  value: id,
                  label: id,
                }))}
              />
            </label>
            <label>
              Latitude
              <input
                name="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                required
                placeholder="-7.28"
              />
            </label>
            <label>
              Longitude
              <input
                name="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                required
                placeholder="112.79"
              />
            </label>
          </div>
          {canPublish && (
            <label className="node-registration-public">
              <input key={locationId} name="public_read" type="checkbox" /> Tampilkan lokasi dan
              pembacaan untuk publik
            </label>
          )}
          <p>
            ID harus sama dengan perangkat yang mengirim data. Pendaftaran tidak membuat pembacaan
            sensor.
          </p>
          {error && <p role="alert">{error}</p>}
          <div className="node-registration-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={busy || !gatewayId || !locationId}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}{" "}
              {busy ? "Menyimpan…" : "Simpan node"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
