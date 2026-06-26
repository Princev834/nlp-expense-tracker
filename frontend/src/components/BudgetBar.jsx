const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

export default function BudgetBar({ budgetData }) {
  if (!budgetData || budgetData.status === 'no_budget') return null;

  const pct    = Math.min(budgetData.percentage_used ?? 0, 100);
  const status = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok';

  const TAG_LABEL = {
    danger:  '[ OVER BUDGET ]',
    warning: '[ WARNING ]',
    ok:      '[ ON TRACK ]',
  }[status];

  const TAG_COLOR = {
    danger:  'var(--danger)',
    warning: 'var(--warning)',
    ok:      'var(--success)',
  }[status];

  const BAR_COLOR = {
    danger:  'var(--danger)',
    warning: 'var(--warning)',
    ok:      '#10B981',
  }[status];

  const fmt = (n) => (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="budget-bar-section" style={{
      background: '#0D0D0D',
      border: '1px solid #1A1A1A',
      borderRadius: '10px',
      padding: '20px 24px',
      marginBottom: '24px',
    }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '14px',
        borderBottom: '1px solid #161616',
        marginBottom: '18px',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: '#333',
          fontWeight: '600',
        }}>
          MONTHLY BUDGET
        </span>

        <span style={{
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: TAG_COLOR,
          fontWeight: '700',
          border: `1px solid ${TAG_COLOR}40`,
          padding: '3px 8px',
          borderRadius: '3px',
          background: `${TAG_COLOR}0D`,
        }}>
          {TAG_LABEL}
        </span>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '10px',
      }}>
        <div>
          <span style={{
            fontFamily: MONO,
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            ₹{fmt(budgetData.spent)}
          </span>
          <span style={{
            fontFamily: MONO,
            fontSize: '11px',
            color: '#333',
            marginLeft: '6px',
            letterSpacing: '0.08em',
          }}>
            SPENT
          </span>
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: '12px',
          color: '#555555',
          letterSpacing: '0.06em',
        }}>
          ₹{fmt(budgetData.total_budget)} BUDGET
        </div>
      </div>

      <div style={{
        height: '3px',
        background: '#161616',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '14px',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(pct, 0.5)}%`,
          background: BAR_COLOR,
          borderRadius: '2px',
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: MONO,
          fontSize: '11px',
          color: BAR_COLOR,
          fontWeight: '700',
          letterSpacing: '0.04em',
        }}>
          {pct.toFixed(1)}% USED
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: '11px',
          color: '#444444',
          letterSpacing: '0.04em',
        }}>
          {budgetData.message}
        </span>
      </div>

    </div>
  );
}