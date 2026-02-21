export function StatBlock({ label, value, unit }: { label: string; value: React.ReactNode; unit?: string }) {
  return (
    <div className="flex flex-col" style={{ minWidth: "80px" }}>
      <span className="font-mono uppercase" style={{ fontSize: "8px", letterSpacing: "0.15em", color: "var(--text-tertiary)" }}>
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.2 }}>
        {value}
      </span>
      {unit && (
        <span className="font-mono" style={{ fontSize: "9px", color: "var(--text-secondary)" }}>
          {unit}
        </span>
      )}
    </div>
  );
}
