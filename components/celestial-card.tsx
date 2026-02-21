import { useState } from "react";
import type { CelestialObject } from "@/types";
import { CornerBrackets, DashedSeparator } from "./linework";
import { formatNumber, getTypeColor, getTypeIcon } from "@/lib/utils";

export function CelestialCard({ item, onClick, isWatchlisted, onToggleWatchlist, viewMode }: { item: CelestialObject; onClick: () => void; isWatchlisted: boolean; onToggleWatchlist: (id: string) => void; viewMode: "grid" | "table" }) {
  const [hovered, setHovered] = useState(false);

  if (viewMode === "table") {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left transition-all duration-200"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 100px 100px 80px",
          alignItems: "center",
          padding: "10px 16px",
          background: hovered ? "var(--bg-elevated)" : "transparent",
          borderBottom: "1px solid var(--line)",
          cursor: "pointer",
          border: "none",
          gap: "12px",
        }}
        aria-label={`View details for ${item.name}`}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: getTypeColor(item.type), fontSize: "14px" }}>{getTypeIcon(item.type)}</span>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{item.name}</span>
            <span className="font-mono ml-2" style={{ fontSize: "9px", color: "var(--text-tertiary)" }}>
              {item.designation}
            </span>
          </div>
        </div>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {item.type}
        </span>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {item.distanceFromSun} {item.distanceUnit}
        </span>
        <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
          {formatNumber(item.radius)} km
        </span>
        <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
          {item.discoveryDate}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left relative transition-all duration-300 w-full"
      style={{
        background: hovered ? "var(--bg-elevated)" : "var(--bg-secondary)",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--line)"}`,
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "2px",
      }}
      aria-label={`View details for ${item.name}`}
    >
      <CornerBrackets size={8} stroke={hovered ? "var(--accent)" : "var(--line)"} />

      {/* Mini planet preview */}
      <div className="flex items-center justify-center" style={{ height: "120px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${item.color}cc, ${item.color}40)`,
            boxShadow: hovered ? `0 0 30px ${item.color}30, 0 0 60px ${item.color}10` : "none",
            transition: "box-shadow 0.4s",
          }}
        />
        {/* Crosshair overlay */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: hovered ? 0.2 : 0.06, transition: "opacity 0.3s" }}>
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="3 5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--text-primary)" strokeWidth="0.5" strokeDasharray="3 5" />
        </svg>
      </div>

      <div style={{ padding: "12px 14px 16px" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ color: getTypeColor(item.type), fontSize: "12px" }}>{getTypeIcon(item.type)}</span>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>{item.name}</h3>
            </div>
            <p className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", margin: "2px 0 0", letterSpacing: "0.08em" }}>
              {item.designation}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item.id);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: isWatchlisted ? "var(--accent)" : "var(--text-tertiary)",
              padding: "2px",
              lineHeight: 1,
            }}
            aria-label={isWatchlisted ? `Remove ${item.name} from watchlist` : `Add ${item.name} to watchlist`}
          >
            {isWatchlisted ? "★" : "☆"}
          </button>
        </div>

        <DashedSeparator className="my-3" />

        <div className="flex gap-4 flex-wrap">
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Dist
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.distanceFromSun} <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{item.distanceUnit}</span>
            </span>
          </div>
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Mass
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.mass} <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{item.massUnit}</span>
            </span>
          </div>
          <div>
            <span className="font-mono uppercase block" style={{ fontSize: "8px", color: "var(--text-tertiary)", letterSpacing: "0.12em" }}>
              Temp
            </span>
            <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {item.temperature.avg}°C
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
