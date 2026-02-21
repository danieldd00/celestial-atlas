export function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center font-mono uppercase"
      style={{
        fontSize: "9px",
        letterSpacing: "0.12em",
        padding: "2px 8px",
        border: `1px solid ${color || "var(--line)"}`,
        color: color || "var(--text-secondary)",
        borderRadius: "1px",
      }}
    >
      {children}
    </span>
  );
}
