export default function BudgetBar({ budgetData }) {
  if (!budgetData || budgetData.status === 'no_budget') {
    return null;
  }

  const pct    = Math.min(budgetData.percentage_used ?? 0, 100);
  const status = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok';

  const statusLabel =
    status === 'danger'  ? 'Over budget!'  :
    status === 'warning' ? 'Approaching limit' :
                           'On track';

  const statusClass =
    status === 'danger'  ? 'danger'   :
    status === 'warning' ? 'warning'  :
                           'on-track';

  const fmt = (n) =>
    (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="budget-bar-section">
      <div className="budget-bar-header">
        <span className="budget-bar-title">Monthly Budget</span>
        <span className="budget-bar-numbers">
          <span>₹{fmt(budgetData.spent)}</span>
          {' '}/ ₹{fmt(budgetData.total_budget)}
        </span>
      </div>

      <div className="budget-track">
        <div
          className={`budget-fill ${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="budget-bar-footer">
        <span className={`budget-status ${statusClass}`}>{statusLabel}</span>
        <span>{pct.toFixed(1)}% used · {budgetData.message}</span>
      </div>
    </div>
  );
}