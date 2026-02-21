export function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono uppercase tracking-wider transition-all duration-200"
      style={{
        fontSize: "10px",
        letterSpacing: "0.15em",
        padding: "8px 16px",
        background: active ? "var(--bg-elevated)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-tertiary)",
        border: "none",
        borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
