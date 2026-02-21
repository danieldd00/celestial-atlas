export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono uppercase transition-all duration-150"
      style={{
        fontSize: "9px",
        letterSpacing: "0.12em",
        padding: "4px 10px",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--bg-primary)" : "var(--text-tertiary)",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        cursor: "pointer",
        borderRadius: "1px",
      }}
    >
      {label}
    </button>
  );
}
