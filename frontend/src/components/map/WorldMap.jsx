import { useState, useRef, useCallback, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import GlassCard from "../ui/GlassCard";
import styles from "./WorldMap.module.css";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const COUNTRY_COLORS = {
    default: {
        fill: "#1E2240",
        stroke: "rgba(139,92,246,0.30)",
        strokeWidth: 0.5,
    },
    option: {
        fill: "#2F365F",
        stroke: "#8B5CF6",
        strokeWidth: 1,
    },
    selected: {
        fill: "#8B5CF6",
        stroke: "#A855F7",
        strokeWidth: 1.5,
    },
    correct: {
        fill: "#22C55E",
        stroke: "#4ADE80",
        strokeWidth: 1.5,
    },
    wrong: {
        fill: "#EF4444",
        stroke: "#F87171",
        strokeWidth: 1.5,
    },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DRAG_THRESHOLD = 4; // px — below this, mouseup is a click not a drag

export default function WorldMap({options, selectedCountry, onCountrySelect, guessResult, correctCountry, interactionLocked}) {
  const [zoom, setZoom]   = useState(1);
  const [center, setCenter] = useState([0, 20]);
  // console.log("Options:", options);

  // Drag-vs-click detection
  const mouseDownPos = useRef(null);
  const isDragging   = useRef(false);

  // ── Zoom helpers (available for zoom buttons if added later) ───
  // const zoomIn  = () => setZoom((z) => Math.min(z * 1.5, MAX_ZOOM));
  // const zoomOut = () => setZoom((z) => Math.max(z / 1.5, MIN_ZOOM));

  // ── Ref for the interactive container (for passive:false listeners) ──
  const containerRef = useRef(null);

  // Attach wheel + touch listeners as passive:false via useEffect
  // (React synthetic events can't call preventDefault on passive listeners)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -1 : 1;
      setZoom((z) => {
        const next = delta > 0 ? z * 1.2 : z / 1.2;
        return Math.min(Math.max(next, MIN_ZOOM), MAX_ZOOM);
      });
    };

    const onTouchStart = (e) => { e.preventDefault(); };
    const onTouchMove  = (e) => { e.preventDefault(); };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
    };
  }, []);

  // ── Mouse down/up for drag-vs-click detection ───────────────────
  const handleMouseDown = useCallback((e) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current   = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!mouseDownPos.current) return;
    const dx = e.clientX - mouseDownPos.current.x;
    const dy = e.clientY - mouseDownPos.current.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      isDragging.current = true;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseDownPos.current = null;
  }, []);

  // ── ZoomableGroup move end ──────────────────────────────────────
  const handleMoveEnd = useCallback((position) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);

  // ── Country click (suppressed during drag) ──────────────────────

  const handleCountryClick = useCallback((geo) => {

    if (isDragging.current) return;

    onCountrySelect({
        id: geo.id,
        name: geo.properties.name,
    });

}, [onCountrySelect]);

  return (
    <GlassCard className={styles.card} hover>
      {/* Container with passive:false listeners via useEffect */}
      <div
        ref={containerRef}
        className={styles.interactiveContainer}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* ── Exact original ComposableMap rendering ── */}
        <ComposableMap
          className={styles.map}
          projection="geoMercator"
          projectionConfig={{ scale: 140, center: [0, 20] }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
            translateExtent={[[-50, -60], [850, 500]]}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // console.log(geo.properties.name);
                  const isOption = options.includes(geo.properties.name);
                  const isSelected = selectedCountry?.id === geo.id;
                  const isCorrect = correctCountry === geo.properties.name;
                  const state = guessResult === "wrong" && isSelected
                                  ? "wrong"
                                  : isCorrect
                                  ? "correct"
                                  : isSelected
                                  ? "selected"
                                  : isOption
                                  ? "option"
                                  : "default";


                  if (isOption) {
                      // console.log("Matched:", geo.properties.name);
                      // console.log(geo.properties);
                  }
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                          if (interactionLocked) return;
                          if (!isOption) return;

                          handleCountryClick(geo);
                      }}
                      style={{
                          default: {
                              fill: COUNTRY_COLORS[state].fill,
                              stroke: COUNTRY_COLORS[state].stroke,
                              strokeWidth: COUNTRY_COLORS[state].strokeWidth,
                              outline: "none",
                              cursor: !interactionLocked && isOption ? "pointer" : "default",
                          },
                          hover: {
                              fill: COUNTRY_COLORS[state].fill,
                              stroke: COUNTRY_COLORS[state].stroke,
                              outline: "none",
                              cursor: !interactionLocked && isOption ? "pointer" : "default",
                          },
                          pressed: {
                              outline: "none",
                          },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </GlassCard>
  );
}
