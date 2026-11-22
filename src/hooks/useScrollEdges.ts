import { useEffect, useState } from "react";

export function useScrollEdges(itemCount: number) {
  const [rail, setRail] = useState<HTMLElement | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    if (!rail) return;

    const measure = () => {
      const start = rail.scrollLeft > 1;
      const end = rail.scrollWidth - rail.clientWidth - rail.scrollLeft > 1;
      setEdges((prev) => prev.start === start && prev.end === end ? prev : { start, end });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    for (const item of rail.children) observer.observe(item);
    rail.addEventListener("scroll", measure, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      rail.removeEventListener("scroll", measure);
    };
  }, [rail, itemCount]);

  return { rail, ref: setRail, edges: { "data-edge-start": edges.start, "data-edge-end": edges.end } };
}
