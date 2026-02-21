import { useEffect, useMemo, useState } from "react";
import type { CelestialObject } from "@/types";
import { CornerBrackets, SchematicFrame, MeasurementLine } from "./linework";
import { formatNumber, getTypeColor, getTypeIcon } from "@/lib/utils";
import { StatBlock } from "./stats-block";
import { Badge } from "./badge";
import { PlanetViewer } from "@/viewers/planet-viewer";
import { TabButton } from "./tabs";
import { MissionTimeline } from "./mission-timeline";

export function DetailView({
  item,
  onClose,
  onPrev,
  onNext,
  isWatchlisted,
  onToggleWatchlist,
  index,
}: {
  item: CelestialObject;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
  index: Record<string, CelestialObject>;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "missions" | "physical" | "gallery">("overview");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, [item.id]);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, [item.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const tabs: Array<"overview" | "missions" | "physical" | "gallery"> = ["overview", "missions", "physical", "gallery"];

  const moons = useMemo(() => {
    const ids = item.moonIds || [];
    return ids.map((id) => index[id]).filter(Boolean);
  }, [item.moonIds, index]);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: "var(--bg-primary)",
        zIndex: 100,
        opacity: entered ? 1 : 0,
        transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
      role="dialog"
      aria-label={`Details for ${item.name}`}
    >
      {/* Top Bar */}
      <header
        className="flex items-center justify-between"
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--line)",
          transform: entered ? "translateY(0)" : "translateY(-10px)",
          opacity: entered ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "6px 12px",
              fontSize: "11px",
              fontFamily: "monospace",
              borderRadius: "2px",
            }}
            aria-label="Close detail view"
          >
            ← BACK
          </button>
          <div className="flex items-center gap-2">
            <span style={{ color: getTypeColor(item.type), fontSize: "16px" }}>{getTypeIcon(item.type)}</span>
            <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{item.name}</h1>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-tertiary)", marginLeft: "4px" }}>
              {item.designation}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleWatchlist(item.id)}
            className="font-mono uppercase"
            style={{
              background: "none",
              border: `1px solid ${isWatchlisted ? "var(--accent)" : "var(--line)"}`,
              color: isWatchlisted ? "var(--accent)" : "var(--text-tertiary)",
              cursor: "pointer",
              padding: "6px 12px",
              fontSize: "10px",
              letterSpacing: "0.1em",
              borderRadius: "2px",
            }}
          >
            {isWatchlisted ? "★ SAVED" : "☆ SAVE"}
          </button>
          <div className="flex gap-1">
            <button onClick={onPrev} style={{ background: "none", border: "1px solid var(--line)", color: "var(--text-secondary)", cursor: "pointer", padding: "6px 10px", borderRadius: "2px" }} aria-label="Previous object">
              ‹
            </button>
            <button onClick={onNext} style={{ background: "none", border: "1px solid var(--line)", color: "var(--text-secondary)", cursor: "pointer", padding: "6px 10px", borderRadius: "2px" }} aria-label="Next object">
              ›
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav
        className="flex"
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "0 24px",
          transform: entered ? "translateY(0)" : "translateY(-10px)",
          opacity: entered ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s",
        }}
        role="tablist"
      >
        {tabs.map((t) => (
          <TabButton key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
            {t}
          </TabButton>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ display: "flex" }}>
        {/* Left panel */}
        <div
          className="flex-1 overflow-auto"
          style={{
            padding: "24px",
            maxWidth: "calc(100% - 420px)",
            transform: entered ? "translateX(0)" : "translateX(-20px)",
            opacity: entered ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "600px" }}>{item.summary}</p>

              <SchematicFrame label="Key Statistics">
                <div className="flex flex-wrap gap-6">
                  <StatBlock label="Distance" value={item.distanceFromSun} unit={item.distanceUnit} />
                  <StatBlock label="Mass" value={item.mass} unit={item.massUnit} />
                  <StatBlock label="Radius" value={formatNumber(item.radius)} unit="km" />
                  {item.gravity && <StatBlock label="Gravity" value={item.gravity} unit="m/s²" />}
                  <StatBlock label="Orbital Period" value={formatNumber(item.orbitalPeriod)} unit="days" />
                  {item.rotationPeriod && <StatBlock label="Rotation" value={item.rotationPeriod} unit="hours" />}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Quick Facts">
                <div className="flex flex-col gap-3">
                  {item.facts.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="font-mono" style={{ fontSize: "9px", color: "var(--accent)", marginTop: "2px" }}>
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Temperature Range" labelRight={`AVG: ${item.temperature.avg}°C`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono" style={{ fontSize: "11px", color: "#6090d0" }}>
                    {item.temperature.min}°C
                  </span>
                  <div style={{ flex: 1, height: "4px", borderRadius: "2px", position: "relative", background: "var(--bg-elevated)" }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "2px",
                        background: `linear-gradient(90deg, #4060a0, #a06040, #d04020)`,
                        opacity: 0.6,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "-2px",
                        left: `${Math.max(0, Math.min(100, ((item.temperature.avg + 250) / 700) * 100))}%`,
                        width: "2px",
                        height: "8px",
                        background: "var(--text-primary)",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#d06040" }}>
                    {item.temperature.max}°C
                  </span>
                </div>
              </SchematicFrame>

              {item.atmosphere.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.12em", marginRight: "8px", paddingTop: "3px" }}>
                    Atmosphere
                  </span>
                  {item.atmosphere.map((a) => (
                    <Badge key={a}>{a}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "missions" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-mono uppercase" style={{ fontSize: "11px", letterSpacing: "0.15em", color: "var(--text-tertiary)", margin: "0 0 16px" }}>
                  Mission & Observation Timeline
                </h2>
                <MissionTimeline missions={item.missions} />
              </div>
            </div>
          )}

          {activeTab === "physical" && (
            <div className="flex flex-col gap-6">
              <SchematicFrame label="Physical Properties">
                <div className="flex flex-col gap-3">
                  <MeasurementLine label="Mass" value={`${item.mass} ${item.massUnit}`} />
                  <MeasurementLine label="Radius" value={`${formatNumber(item.radius)} km`} />
                  <MeasurementLine label="Gravity" value={item.gravity ? `${item.gravity} m/s²` : "—"} />
                  <MeasurementLine label="Orbital" value={item.orbitalPeriod ? `${formatNumber(item.orbitalPeriod)} days` : "—"} />
                  <MeasurementLine label="Rotation" value={item.rotationPeriod ? `${item.rotationPeriod} hrs` : "—"} />
                  <MeasurementLine label="Rings" value={item.rings ? "Yes" : "No"} />
                  <MeasurementLine label="Moons" value={item.moons !== null ? String(item.moons) : "Unknown"} />
                </div>
              </SchematicFrame>

              <SchematicFrame label="Composition">
                <div className="flex flex-col gap-2">
                  {item.composition.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div style={{ width: "6px", height: "6px", background: item.accentColor, borderRadius: "1px", opacity: 1 - i * 0.2 }} />
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c}</span>
                    </div>
                  ))}
                </div>
              </SchematicFrame>

              <SchematicFrame label="Temperature">
                <div className="flex flex-col gap-3">
                  <MeasurementLine label="Minimum" value={`${item.temperature.min}°C`} />
                  <MeasurementLine label="Average" value={`${item.temperature.avg}°C`} />
                  <MeasurementLine label="Maximum" value={`${item.temperature.max}°C`} />
                </div>
              </SchematicFrame>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="flex flex-col gap-6">
              <SchematicFrame label="Orbital Diagram">
                <div className="flex items-center justify-center" style={{ height: "260px", position: "relative" }}>
                  <svg width="300" height="260" viewBox="0 0 300 260">
                    {/* Sun */}
                    <circle cx="150" cy="130" r="8" fill="#f0c040" opacity="0.8" />
                    <circle cx="150" cy="130" r="12" fill="none" stroke="#f0c040" strokeWidth="0.5" opacity="0.3" />
                    {/* Orbit */}
                    <ellipse cx="150" cy="130" rx="120" ry="80" fill="none" stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3 4" />
                    {/* Planet */}
                    <circle cx="270" cy="130" r="5" fill={item.color} />
                    <circle cx="270" cy="130" r="10" fill="none" stroke={item.accentColor} strokeWidth="0.5" opacity="0.3" />
                    {/* Labels */}
                    <text x="150" y="155" textAnchor="middle" fill="var(--text-tertiary)" fontSize="8" fontFamily="monospace">
                      HOST STAR
                    </text>
                    <text x="270" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace">
                      {item.name.toUpperCase()}
                    </text>
                  </svg>
                </div>
              </SchematicFrame>

              <SchematicFrame label="Scale Comparison">
                <div className="flex items-end justify-center gap-6" style={{ height: "140px", paddingBottom: "20px" }}>
                  {/* Earth reference */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 35%, #6ab0e0, #2a5080)",
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: "8px", color: "var(--text-tertiary)" }}>
                      EARTH
                    </span>
                  </div>
                  {/* Object */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      style={{
                        width: `${Math.max(8, Math.min(100, (item.radius / 6371) * 24))}px`,
                        height: `${Math.max(8, Math.min(100, (item.radius / 6371) * 24))}px`,
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 35%, ${item.color}cc, ${item.color}40)`,
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: "8px", color: "var(--text-tertiary)" }}>
                      {item.name.toUpperCase()}
                    </span>
                  </div>
                </div>
              </SchematicFrame>

              <div className="flex flex-wrap gap-2">
                <span className="font-mono uppercase" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.12em", marginRight: "8px", paddingTop: "3px" }}>
                  Discovery
                </span>
                <Badge>{item.discoveryDate}</Badge>
                <Badge>{item.discoveryMethod}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - 3D Viewer */}
        <div
          className="detail-right"
          style={{
            width: "420px",
            minWidth: "420px",
            borderLeft: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            background: "var(--bg-secondary)",
            transform: entered ? "translateX(0)" : "translateX(20px)",
            opacity: entered ? 1 : 0,
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s",
            padding: "10px 0",
          }}
        >
          <CornerBrackets size={14} stroke="var(--line)" />

          <div style={{ width: "100%", padding: "0 16px" }}>
            <PlanetViewer id={item.id} type={item.type} color={item.color} accentColor={item.accentColor} name={item.name} hasRings={item.rings} />
          </div>

          <div className="absolute bottom-6 left-6 right-6" style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
            <div className="flex flex-wrap gap-2">
              <Badge color={getTypeColor(item.type)}>{item.type}</Badge>
              {item.rings && <Badge>RINGS</Badge>}
              {(item.moons ?? 0) > 0 && (
                <Badge>
                  {item.moons} MOON{(item.moons ?? 0) > 1 ? "S" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsiveness for detail view */}
      <style>{`
        @media (max-width: 980px) {
          .detail-left { max-width: 100% !important; }
        }
        @media (max-width: 860px) {
          .detail-body { flex-direction: column !important; }
          .detail-left { padding: 18px !important; }
          .detail-right {
            width: 100% !important;
            min-width: 100% !important;
            border-left: none !important;
            border-top: 1px solid var(--line) !important;
            padding: 12px 0 64px !important;
          }
          .detail-topbar, .detail-tabs { padding-left: 14px !important; padding-right: 14px !important; }
        }
      `}</style>
    </div>
  );
}
