import { useEffect, useState } from "react";
import type { Mission } from "@/types";
import { Badge } from "./badge";

export function MissionTimeline({ missions }: { missions: Mission[] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, [missions]);

  const statusColors: Record<string, string> = {
    Complete: "var(--text-tertiary)",
    Active: "#40c060",
    "En Route": "var(--accent)",
    Planned: "#6090d0",
    Proposed: "#a080c0",
  };

  if (!missions || missions.length === 0) {
    return <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>No missions catalogued for this object.</p>;
  }

  return (
    <div className="flex flex-col gap-0" role="list" aria-label="Mission timeline">
      {missions.map((m, i) => (
        <div
          key={m.name}
          className="flex gap-4"
          role="listitem"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-20px)",
            transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
          }}
        >
          <div className="flex flex-col items-center" style={{ width: "32px" }}>
            <span className="font-mono" style={{ fontSize: "10px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
              {m.year}
            </span>
            <div style={{ width: "1px", flex: 1, background: "var(--line)", opacity: 0.3, margin: "4px 0" }} />
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                border: `1.5px solid ${statusColors[m.status] || "var(--line)"}`,
                background: m.status === "Active" ? statusColors[m.status] : "transparent",
              }}
            />
            {i < missions.length - 1 && <div style={{ width: "1px", flex: 1, background: "var(--line)", opacity: 0.3, margin: "4px 0" }} />}
          </div>
          <div style={{ padding: "0 0 20px 0", flex: 1 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                {m.name}
              </span>
              <Badge color={statusColors[m.status]}>{m.status}</Badge>
              <Badge>{m.type}</Badge>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>{m.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
