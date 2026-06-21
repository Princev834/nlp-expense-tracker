import { getCategoryMeta } from '../utils/categoryConfig';

export default function CategoryBreakdown({ summary }) {

  if (!summary || !summary.by_category || summary.by_category.length === 0) {
    return null;
  }

  const categories = summary.by_category;
  const topTotal   = categories[0]?.total ?? 1;

  const fmt = (n) =>
    n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="breakdown-card">
      <p className="chart-title">Category Breakdown</p>

      <div className="breakdown-list">
        {categories.map((cat) => {
          const meta      = getCategoryMeta(cat.category);
          const barWidth  = `${(cat.total / topTotal) * 100}%`;

          return (
            <div key={cat.category} className="breakdown-row">
              <div
                className="breakdown-icon"
                style={{ background: meta.bg }}
              >
                {meta.icon}
              </div>

              <div className="breakdown-info">
                <div className="breakdown-name">{cat.category}</div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-fill"
                    style={{ width: barWidth, background: meta.color }}
                  />
                </div>
              </div>

              <div className="breakdown-right">
                <div className="breakdown-amount">₹{fmt(cat.total)}</div>
                <div className="breakdown-pct">{cat.percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          borderTop:  '1px solid var(--border)',
          marginTop:  '8px', paddingTop: '14px',
          display:    'flex', justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
          Total · {categories.reduce((a, c) => a + c.count, 0)} expenses
        </span>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
          ₹{fmt(summary.total)}
        </span>
      </div>
    </div>
  );
}