export function CornerBrackets({ className = "", size = 12, stroke = "var(--line)" }: { className?: string; size?: number; stroke?: string }) {
  return (
    <>
      <svg className={`absolute top-0 left-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 ${size} L0 0 L${size} 0`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute top-0 right-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 L${size} 0 L${size} ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 left-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 L0 ${size} L${size} ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className={`absolute bottom-0 right-0 ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M${size} 0 L${size} ${size} L0 ${size}`} fill="none" stroke={stroke} strokeWidth="1" />
      </svg>
    </>
  );
}

export function SchematicFrame({ children, className = "", label = "", labelRight = "" }: { children: React.ReactNode; className?: string; label?: string; labelRight?: string }) {
  return (
    <div className={`relative ${className}`} style={{ padding: "1px" }}>
      <CornerBrackets size={10} />
      {label && (
        <span
          className="absolute text-xs font-mono tracking-widest uppercase"
          style={{
            top: "-8px",
            left: "18px",
            color: "var(--text-tertiary)",
            fontSize: "9px",
            letterSpacing: "0.15em",
            background: "var(--bg-primary)",
            padding: "0 6px",
          }}
        >
          {label}
        </span>
      )}
      {labelRight && (
        <span
          className="absolute text-xs font-mono"
          style={{
            top: "-8px",
            right: "18px",
            color: "var(--text-tertiary)",
            fontSize: "9px",
            background: "var(--bg-primary)",
            padding: "0 6px",
          }}
        >
          {labelRight}
        </span>
      )}
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

export function DashedSeparator({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        height: "1px",
        background: `repeating-linear-gradient(90deg, var(--line) 0px, var(--line) 4px, transparent 4px, transparent 10px)`,
        opacity: 0.5,
      }}
    />
  );
}

export function MeasurementLine({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
      <span className="font-mono uppercase tracking-wider" style={{ fontSize: "9px", color: "var(--text-tertiary)", minWidth: "60px" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--line)", opacity: 0.3 }} />
      <span className="font-mono" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        opacity: 0.03,
        backgroundImage: `
          linear-gradient(var(--text-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        zIndex: 0,
      }}
    />
  );
}
