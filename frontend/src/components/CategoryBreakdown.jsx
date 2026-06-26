import { getCategoryMeta } from '../utils/categoryConfig';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

export default function CategoryBreakdown({ summary }) {
  if (!summary?.by_category?.length) return null;

  const categories = summary.by_category;
  const fmt = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="breakdown-card">

      <p className="chart-title" style={{
        borderLeft: '2px solid var(--accent)',
        paddingLeft: '10px',
        marginBottom: '4px',
        fontFamily: MONO,
        fontSize: '11px',
        letterSpacing: '0.12em',
        color: 'var(--muted)',
      }}>
        CATEGORY BREAKDOWN
      </p>

      <div className="breakdown-list" style={{ marginTop: '16px' }}>
        {categories.map((cat, i) => {
          const meta = getCategoryMeta(cat.category);

          const SLOT_COLORS = ['#6366F1','#14B8A6','#F59E0B','#F43F5E','#8B5CF6','#0EA5E9'];
          const slotColor = SLOT_COLORS[i % SLOT_COLORS.length];

          return (
            <div key={cat.category} className="breakdown-row" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 0',
              borderBottom: '1px solid #141414',
            }}>

              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: `${slotColor}14`,
                border: `1px solid ${slotColor}28`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '17px',
                flexShrink: 0,
              }}>
                {meta.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {cat.category}
                </div>

                <div style={{
                  height: '2px',
                  background: '#1A1A1A',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${cat.percentage}%`,
                    background: slotColor,
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              <div style={{
                textAlign: 'right',
                flexShrink: 0,
                minWidth: '72px',
              }}>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  letterSpacing: '-0.02em',
                }}>
                  ₹{fmt(cat.total)}
                </div>
                <div style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  color: slotColor,
                  fontWeight: '600',
                  marginTop: '2px',
                  letterSpacing: '0.04em',
                }}>
                  {cat.percentage}%
                </div>
              </div>

            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        marginTop: '4px',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: '10px',
          color: '#333',
          letterSpacing: '0.12em',
        }}>
          TOTAL · {categories.reduce((a, c) => a + c.count, 0)} EXPENSES
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: '16px',
          fontWeight: '800',
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>
          ₹{fmt(summary.total)}
        </span>
      </div>

    </div>
  );
}