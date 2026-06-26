const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

export default function InsightCard({
  icon, iconBg, iconColor,
  value, label, subValue, trend, trendColor
}) {
  return (
    <div className="insight-card" style={{ padding: '16px' }}>

      <div
        className="insight-icon-wrap"
        style={{
          background: iconBg,
          width: '32px',
          height: '32px',
          marginBottom: '12px',
          borderRadius: '6px',
        }}
      >
        <span style={{ color: iconColor, fontSize: '15px' }}>{icon}</span>
      </div>

      <div className="insight-value" style={{ fontSize: '22px', marginBottom: '4px' }}>
        {value}
      </div>

      <div className="insight-label" style={{ fontSize: '10px' }}>{label}</div>

      {subValue && (
        <div style={{
          fontFamily: MONO,
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '2px',
        }}>
          {subValue}
        </div>
      )}

      {trend && (
        <div
          className="insight-trend"
          style={{
            color: trendColor ?? 'var(--text-muted)',
            fontSize: '10px',
            paddingTop: '10px',
            fontFamily: MONO,
            marginTop: 'auto',
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}