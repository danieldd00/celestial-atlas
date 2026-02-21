import { useEffect, useRef } from "react";

export function SearchInput({ value, onChange, onClear }: { value: string; onChange: (next: string) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && (document.activeElement as HTMLElement | null)?.tagName !== "INPUT") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative flex items-center" style={{ maxWidth: "360px", width: "100%" }}>
      <span className="absolute left-3" style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
        ⌕
      </span>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search celestial objects..."
        className="w-full font-mono"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--line)",
          color: "var(--text-primary)",
          padding: "10px 36px 10px 32px",
          fontSize: "12px",
          outline: "none",
          borderRadius: "2px",
        }}
        aria-label="Search celestial objects"
      />
      {value && (
        <button onClick={onClear} className="absolute right-2" style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }} aria-label="Clear search">
          ✕
        </button>
      )}
      <span className="absolute right-8 font-mono" style={{ fontSize: "9px", color: "var(--text-tertiary)", border: "1px solid var(--line)", padding: "1px 4px", borderRadius: "2px" }}>
        /
      </span>
    </div>
  );
}
