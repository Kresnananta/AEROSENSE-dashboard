import { mapDrawings } from "./map-drawings";

export function MapSymbol({ kind }: { kind: keyof typeof mapDrawings }) {
  return (
    <span className={`map-pin pin-${kind}`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: mapDrawings[kind] }}
      />
    </span>
  );
}
