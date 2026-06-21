export default function InsightCard({
  icon, iconBg, iconColor,
  value, label, subValue, trend, trendColor
}) {
  return (
    <div className="insight-card">
      <div
        className="insight-icon-wrap"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor, fontSize: '18px' }}>{icon}</span>
      </div>

      <div className="insight-value">{value}</div>

      <div className="insight-label">{label}</div>

      {subValue && <div className="insight-sub">{subValue}</div>}

      {trend && (
        <div
          className="insight-trend"
          style={{ color: trendColor ?? 'var(--muted)' }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}