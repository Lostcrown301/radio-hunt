/**
 * useMapZoom
 * ──────────
 * Attaches d3-zoom to the first <svg> found inside a container div.
 * This avoids needing forwardRef on the map library's ComposableMap.
 *
 * Returns:
 *  containerRef  — attach to the outermost div (for passive:false event listeners)
 *  svgRef        — attach to the div that wraps ComposableMap (hook queries its svg)
 *  transform     — { x, y, k } — use as SVG <g transform="translate(x,y) scale(k)">
 *  isRealClick() — returns true if the last gesture was a click, not a drag
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";

const MIN_ZOOM       = 1;
const MAX_ZOOM       = 8;
const DRAG_THRESHOLD = 4; // px before a mousedown+mouseup is treated as a drag

export function useMapZoom({ width, height }) {
  const svgRef       = useRef(null);   // wraps the ComposableMap div
  const containerRef = useRef(null);   // outermost container (touch/wheel target)
  const zoomRef      = useRef(null);

  const transformRef = useRef(zoomIdentity);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const isDraggingRef = useRef(false);
  const dragStartRef  = useRef({ x: 0, y: 0 });
  const pointerInRef  = useRef(false);

  const applyTransform = useCallback((t) => {
    transformRef.current = t;
    setTransform({ x: t.x, y: t.y, k: t.k });
  }, []);

  useEffect(() => {
    // Wait until both dimensions are known and the wrapper is in the DOM
    if (!width || !height || !svgRef.current) return;

    // Find the <svg> rendered by ComposableMap inside our wrapper div
    const svgEl = svgRef.current.querySelector("svg");
    if (!svgEl) return;

    // ── Build d3-zoom behaviour ──────────────────────────────────────
    const zoomBehavior = d3zoom()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      // Constrain pan: map content never leaves the viewport
      .translateExtent([
        [-(width  * 0.02), -(height * 0.02)],
        [ (width  * 1.02),  (height * 1.02)],
      ])
      .filter((event) => {
        if (event.type === "contextmenu") return false;
        return true;
      })
      .on("start", (event) => {
        const se = event.sourceEvent;
        if (se?.type === "mousedown") {
          isDraggingRef.current = false;
          dragStartRef.current  = { x: se.clientX, y: se.clientY };
          svgEl.style.cursor = "grabbing";
        }
      })
      .on("zoom", (event) => {
        const { transform: t, sourceEvent: se } = event;

        if (se?.type === "mousemove") {
          const dx = se.clientX - dragStartRef.current.x;
          const dy = se.clientY - dragStartRef.current.y;
          if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            isDraggingRef.current = true;
          }
        }

        applyTransform(t);
      })
      .on("end", () => {
        svgEl.style.cursor = "grab";
      });

    zoomRef.current = zoomBehavior;

    const sel = select(svgEl);
    sel.call(zoomBehavior);
    // Start at identity (scale=1, no translation)
    sel.call(zoomBehavior.transform, zoomIdentity);

    svgEl.style.cursor = "grab";

    return () => {
      sel.on(".zoom", null);
    };
  }, [width, height, applyTransform]);

  // ── Passive:false event listeners on the container ──────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopWheel = (e) => {
      if (pointerInRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const stopTouch = (e) => {
      // Only preventDefault when we own the gesture (touches inside container)
      e.preventDefault();
    };

    const onEnter = () => { pointerInRef.current = true;  };
    const onLeave = () => { pointerInRef.current = false; };

    container.addEventListener("wheel",        stopWheel, { passive: false });
    container.addEventListener("touchstart",   stopTouch, { passive: false });
    container.addEventListener("touchmove",    stopTouch, { passive: false });
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      container.removeEventListener("wheel",        stopWheel);
      container.removeEventListener("touchstart",   stopTouch);
      container.removeEventListener("touchmove",    stopTouch);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const isRealClick = useCallback(() => !isDraggingRef.current, []);

  return { transform, svgRef, containerRef, isRealClick };
}
