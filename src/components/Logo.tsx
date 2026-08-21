export function Logo({ size = 30, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <img
        src="/logo.jpeg"
        alt="TradeXBot"
        width={size}
        height={size}
        style={{ borderRadius: 8, objectFit: "cover", display: "block" }}
      />
      {showText && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontWeight: 700,
            fontSize: Math.max(11, size * 0.42),
            letterSpacing: "-0.04em",
            fontFamily: '"Michroma", "Oxanium", sans-serif',
          }}
        >
          <span className="gradient-text">TradeXBot</span>
        </span>
      )}
    </div>
  );
}
