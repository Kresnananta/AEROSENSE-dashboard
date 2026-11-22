import { mapPinArt, type MapPinKind } from "./map-drawings";

export function MapSymbol({ kind }: { kind: MapPinKind }) {
  return (
    <span
      className={`map-pin pin-${kind}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: mapPinArt(kind) }}
    />
  );
}
