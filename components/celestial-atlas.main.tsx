"use client";

import { CELESTIAL_DATA, CELESTIAL_INDEX, CELESTIAL_TYPES } from "@/constants/data";
import { CelestialType } from "@/types";
import { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";
import { Starfield } from "./background";
import { DashedSeparator, GridOverlay } from "./linework";
import { SearchInput } from "./search";
import { FilterChip } from "./filter";
import { CelestialCard } from "./celestial-card";
import { DetailView } from "./detail-panel";

export default function CelestialAtlas() {
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<CelestialType[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "distance" | "mass" | "radius">("name");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Persist watchlist in memory (no localStorage per artifact rules)
  const toggleWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleTypeFilter = useCallback((type: CelestialType) => {
    setTypeFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }, []);

  const filtered = useMemo(() => {
    let items = [...CELESTIAL_DATA];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.designation.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
    }
    if (typeFilters.length > 0) {
      items = items.filter((i) => typeFilters.includes(i.type));
    }
    items.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "distance") return a.distanceFromSun - b.distanceFromSun;
      if (sortBy === "mass") return b.mass - a.mass;
      if (sortBy === "radius") return b.radius - a.radius;
      return 0;
    });
    return items;
  }, [search, typeFilters, sortBy]);

  const selectedItem = useMemo(() => (selectedId ? CELESTIAL_INDEX[selectedId] : null), [selectedId]);

  const navigateDetail = useCallback(
    (dir: number) => {
      if (!selectedId) return;
      const idx = filtered.findIndex((i) => i.id === selectedId);
      const next = idx + dir;
      if (next >= 0 && next < filtered.length) setSelectedId(filtered[next].id);
    },
    [selectedId, filtered],
  );

  const themeVars = darkMode
    ? {
        "--bg-primary": "#0a0a0c",
        "--bg-secondary": "#0e0e12",
        "--bg-elevated": "#14141a",
        "--text-primary": "#e8e8ec",
        "--text-secondary": "#8a8a96",
        "--text-tertiary": "#4a4a56",
        "--line": "#1e1e28",
        "--accent": "#c8965a",
        "--accent-dim": "#c8965a20",
      }
    : {
        "--bg-primary": "#f6f5f3",
        "--bg-secondary": "#eeedeb",
        "--bg-elevated": "#ffffff",
        "--text-primary": "#1a1a1e",
        "--text-secondary": "#6a6a76",
        "--text-tertiary": "#9a9aa6",
        "--line": "#d8d8de",
        "--accent": "#a06830",
        "--accent-dim": "#a0683020",
      };

  return (
    <div
      style={{
        ...(themeVars as React.CSSProperties),
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; background: ${darkMode ? "#0a0a0c" : "#f6f5f3"}; }
        ::selection { background: var(--accent); color: var(--bg-primary); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .anim-in { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .anim-in { animation: none; opacity: 1; transform: none; }
        }
        input::placeholder { color: var(--text-tertiary); }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        input:focus-visible { outline: 2px solid var(--accent); outline-offset: 0; }

        /* --- Mobile responsiveness (minimal, no redesign) --- */
        @media (max-width: 760px) {
          .atlas-header-inner { padding: 12px 14px !important; flex-wrap: wrap; gap: 12px !important; }
          .atlas-main { padding: 16px 14px !important; }
          .atlas-toolbar { gap: 10px !important; }
          .atlas-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .atlas-table-row { min-width: 560px; }
        }
      `}</style>

      {darkMode && <Starfield />}
      <GridOverlay />

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: `${darkMode ? "rgba(10,10,12,0.85)" : "rgba(246,245,243,0.85)"}`,
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="flex items-center justify-between" style={{ padding: "14px 24px", maxWidth: "1400px", margin: "0 auto" }}>
          <div className="flex items-center gap-3">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" fill="var(--accent)" />
                <circle cx="10" cy="10" r="7" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4" />
                <circle cx="10" cy="10" r="9.5" fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.25" />
              </svg>
              <h1 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-primary)" }}>CELESTIAL ATLAS</h1>
            </div>
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
              v2.1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearch("");
                setTypeFilters([]);
                setSelectedId(null);
                // Show only watchlisted
                if (typeFilters.length === 0 && watchlist.length > 0) {
                  // Toggle watchlist view - simple approach
                }
              }}
              className="font-mono uppercase"
              style={{
                fontSize: "9px",
                letterSpacing: "0.12em",
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-tertiary)",
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              ★ {watchlist.length} SAVED
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "6px 10px",
                fontSize: "13px",
                borderRadius: "2px",
                lineHeight: 1,
              }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "◐" : "◑"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Explore View */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* Search + Filters */}
        <div className="anim-in flex flex-col gap-4" style={{ marginBottom: "24px" }}>
          <div className="flex flex-wrap items-center gap-4">
            <SearchInput value={search} onChange={setSearch} onClear={() => setSearch("")} />
            <div className="flex gap-1 flex-wrap">
              {CELESTIAL_TYPES.map((t) => (
                <FilterChip key={t} label={t} active={typeFilters.includes(t)} onClick={() => toggleTypeFilter(t)} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
              {filtered.length} OBJECT{filtered.length !== 1 ? "S" : ""} FOUND
            </span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {(["name", "distance", "mass", "radius"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className="font-mono uppercase"
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.08em",
                      padding: "3px 8px",
                      background: sortBy === s ? "var(--accent-dim)" : "none",
                      color: sortBy === s ? "var(--accent)" : "var(--text-tertiary)",
                      border: `1px solid ${sortBy === s ? "var(--accent)" : "transparent"}`,
                      cursor: "pointer",
                      borderRadius: "1px",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <DashedSeparator className="w-4" />

              <div className="flex gap-1">
                {(["grid", "table"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className="font-mono uppercase"
                    style={{
                      fontSize: "9px",
                      padding: "3px 8px",
                      background: viewMode === v ? "var(--bg-elevated)" : "none",
                      color: viewMode === v ? "var(--text-primary)" : "var(--text-tertiary)",
                      border: `1px solid ${viewMode === v ? "var(--line)" : "transparent"}`,
                      cursor: "pointer",
                      borderRadius: "1px",
                    }}
                  >
                    {v === "grid" ? "▦" : "☰"} {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Header (table mode) */}
        {viewMode === "table" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 100px 80px",
              padding: "8px 16px",
              borderBottom: "1px solid var(--line)",
              gap: "12px",
            }}
          >
            {["Name", "Type", "Distance", "Radius", "Discovered"].map((h) => (
              <span key={h} className="font-mono uppercase" style={{ fontSize: "8px", letterSpacing: "0.15em", color: "var(--text-tertiary)" }}>
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Object Grid / Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "80px 24px", color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: "32px", marginBottom: "16px" }}>⊘</span>
            <p className="font-mono" style={{ fontSize: "12px" }}>
              No celestial objects match your search
            </p>
            <button
              onClick={() => {
                setSearch("");
                setTypeFilters([]);
              }}
              className="font-mono"
              style={{
                marginTop: "12px",
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-secondary)",
                padding: "6px 16px",
                fontSize: "11px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            style={
              viewMode === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "16px",
                  }
                : { display: "flex", flexDirection: "column" }
            }
          >
            {filtered.map((item, i) => (
              <div key={item.id} className="anim-in" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                <CelestialCard item={item} onClick={() => setSelectedId(item.id)} isWatchlisted={watchlist.includes(item.id)} onToggleWatchlist={toggleWatchlist} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: "60px", padding: "24px 0", borderTop: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
              CELESTIAL ATLAS · {CELESTIAL_DATA.length} OBJECTS CATALOGUED
            </span>
            <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)" }}>
              <span style={{ opacity: 0.5 }}>KBD</span> / = SEARCH · ESC = CLOSE · ← → = NAV
            </span>
          </div>
        </footer>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailView
          item={selectedItem}
          index={CELESTIAL_INDEX}
          onClose={() => setSelectedId(null)}
          onPrev={() => navigateDetail(-1)}
          onNext={() => navigateDetail(1)}
          isWatchlisted={watchlist.includes(selectedItem.id)}
          onToggleWatchlist={toggleWatchlist}
        />
      )}
    </div>
  );
}
