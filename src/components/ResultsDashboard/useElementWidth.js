import { useEffect, useRef, useState } from 'react';

/**
 * Measures a container so charts can render at real pixel width. Rendering into
 * a scaled viewBox instead would distort stroke weights and axis text, which is
 * exactly what the mark specs are trying to hold fixed.
 */
export default function useElementWidth(initial = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => setWidth(Math.max(320, Math.round(el.clientWidth)));
    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
