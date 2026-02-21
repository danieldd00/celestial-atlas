import { CelestialType } from "@/types";

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return n.toLocaleString();
  return String(n);
}

export function getTypeIcon(type: CelestialType): string {
  const icons: Record<CelestialType, string> = {
    planet: "◉",
    star: "✦",
    exoplanet: "⊕",
    moon: "☽",
    "dwarf planet": "◎",
  };
  return icons[type] || "○";
}

export function getTypeColor(type: CelestialType): string {
  const colors: Record<CelestialType, string> = {
    planet: "var(--accent)",
    star: "#f0c040",
    exoplanet: "#60b0e0",
    moon: "#a0a0b8",
    "dwarf planet": "#c0a080",
  };
  return colors[type] || "var(--accent)";
}
