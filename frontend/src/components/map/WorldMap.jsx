import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import GlassCard from "../ui/GlassCard";
import styles from "./WorldMap.module.css";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Algeria ISO numeric code = 012
const HIGHLIGHTED_ISO = "012";
const MARKER_COORDS   = [2.6, 28.0]; // lon, lat — Algeria center
const MARKER_LABEL    = "Algeria";

export default function WorldMap() {
  return (
    <GlassCard className={styles.card} hover>
      <ComposableMap
        className={styles.map}
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [0, 20] }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isHighlighted = geo.id === HIGHLIGHTED_ISO;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill:         isHighlighted ? "#34D399" : "#1e2240",
                      stroke:       isHighlighted ? "#34D399" : "rgba(139,92,246,0.30)",
                      strokeWidth:  isHighlighted ? 1.5 : 0.5,
                      outline:      "none",
                    },
                    hover: {
                      fill:    isHighlighted ? "#34D399" : "#2a2f56",
                      outline: "none",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Country label tooltip */}
        <Marker coordinates={MARKER_COORDS}>
          <rect
            x={-32}
            y={-26}
            width={64}
            height={22}
            rx={5}
            fill="rgba(13,14,30,0.85)"
            stroke="rgba(52,211,153,0.5)"
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            y={-10}
            style={{ fontSize: 11, fontFamily: "Inter,sans-serif", fill: "#E6E8F2", fontWeight: 600 }}
          >
            {MARKER_LABEL}
          </text>
        </Marker>
      </ComposableMap>
    </GlassCard>
  );
}
