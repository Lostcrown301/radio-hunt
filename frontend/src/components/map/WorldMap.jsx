/**
 * WorldMap
 * ────────
 * Interactive world map with GeoGuessr-style zoom/pan.
 *
 * Props:
 *  selectedCountry   — ISO numeric string (e.g. "012" for Algeria)
 *  onSelectCountry   — callback(isoId, countryName)
 *  markerCoords      — [lon, lat]
 *  markerLabel       — string
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useMapZoom } from "../../hooks/useMapZoom";
import GlassCard from "../ui/GlassCard";
import styles from "./WorldMap.module.css";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Demo defaults — these will come from game props in production
const DEMO_ISO    = "012";
const DEMO_COORDS = [2.6, 28.0];
const DEMO_LABEL  = "Algeria";

// Colours
const C_DEFAULT     = "#1e2240";
const C_HOVER       = "#2d3460";
const C_SELECTED    = "#34D399";
const C_STROKE      = "rgba(139,92,246,0.30)";
const C_STROKE_SEL  = "#34D399";

// ── ResizeObserver to measure the container ──────────────────────────
function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

export default function WorldMap({
  selectedCountry = DEMO_ISO,
  onSelectCountry = () => {},
  markerCoords    = DEMO_COORDS,
  markerLabel     = DEMO_LABEL,
}) {
  // Measure available space
  const wrapRef = useRef(null);
  const { width, height } = useElementSize(wrapRef);

  // Zoom/pan
  const { transform, svgRef, containerRef, isRealClick } = useMapZoom({ width, height });

  // Hover state (desktop only — no hover on touch)
  const [hoveredId, setHoveredId] = useState(null);

  const handleClick = useCallback(
    (geo) => {
      if (!isRealClick()) return;
      onSelectCountry(geo.id, geo.properties?.name ?? geo.id);
    },
    [isRealClick, onSelectCountry]
  );

  // d3 zoom transform string applied to the <g>
  const gTransform = `translate(${transform.x},${transform.y}) scale(${transform.k})`;

  // Compute projection scale from width so map fills the card at zoom=1
  const projScale = width > 0 ? (width / 6.28) * 0.85 : 140;

  return (
    <GlassCard className={styles.card}>
      {/* containerRef: passive:false wheel + touch listeners */}
      <div ref={containerRef} className={styles.zoomContainer}>
        {/* svgRef: hook queries the <svg> inside this div */}
        <div ref={svgRef} className={styles.mapInner}>
          {/* wrapRef: measured by ResizeObserver */}
          <div ref={wrapRef} className={styles.mapWrap}>
            {width > 0 && height > 0 && (
              <ComposableMap
                width={width}
                height={height}
                projection="geoMercator"
                projectionConfig={{ scale: projScale, center: [0, 20] }}
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                {/* All geography rendered inside this transformed group */}
                <g transform={gTransform} className={styles.zoomGroup}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isSel   = geo.id === selectedCountry;
                        const isHov   = geo.id === hoveredId && !isSel;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setHoveredId(geo.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => handleClick(geo)}
                            style={{
                              default: {
                                fill:        isSel ? C_SELECTED : C_DEFAULT,
                                stroke:      isSel ? C_STROKE_SEL : C_STROKE,
                                strokeWidth: isSel ? 1.5 / transform.k : 0.5 / transform.k,
                                outline:     "none",
                                cursor:      "pointer",
                              },
                              hover: {
                                fill:        isSel ? C_SELECTED : C_HOVER,
                                stroke:      isSel ? C_STROKE_SEL : C_STROKE,
                                strokeWidth: isSel ? 1.5 / transform.k : 0.5 / transform.k,
                                outline:     "none",
                                cursor:      "pointer",
                              },
                              pressed: {
                                fill:    isSel ? C_SELECTED : C_HOVER,
                                outline: "none",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Tooltip marker — scales inverse to zoom so text stays readable */}
                  {markerCoords && markerLabel && (
                    <Marker coordinates={markerCoords}>
                      <g transform={`scale(${1 / transform.k})`}>
                        <rect
                          x={-34} y={-28}
                          width={68} height={22}
                          rx={5}
                          fill="rgba(13,14,30,0.90)"
                          stroke="rgba(52,211,153,0.55)"
                          strokeWidth={1}
                        />
                        <text
                          textAnchor="middle"
                          y={-12}
                          style={{
                            fontSize:      11,
                            fontFamily:    "Inter, sans-serif",
                            fill:          "#E6E8F2",
                            fontWeight:    600,
                            pointerEvents: "none",
                            userSelect:    "none",
                          }}
                        >
                          {markerLabel}
                        </text>
                      </g>
                    </Marker>
                  )}
                </g>
              </ComposableMap>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
