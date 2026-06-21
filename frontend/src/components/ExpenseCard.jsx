import { getCategoryMeta } from '../utils/categoryConfig';

function formatDate(str) {
  if (!str) return '';
  const today = new Date();
  const d     = new Date(str + 'T00:00:00');
  const diff  = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ExpenseCard({ expense, onDelete }) {
  const meta = getCategoryMeta(expense.category);

  return (
    <div className="expense-card">
      <div
        className="expense-icon-wrap"
        style={{ background: meta.bg }}
      >
        {meta.icon}
      </div>

      <div className="expense-info">
        <div className="expense-desc">
          {expense.description || expense.category}
        </div>
        <div className="expense-meta">
          <span
            className="expense-category-dot"
            style={{ background: meta.color }}
          />
          {expense.category}
          {expense.merchant && (
            <> · <span style={{ color: '#94A3B8' }}>{expense.merchant}</span></>
          )}
        </div>
      </div>

      <div className="expense-right">
        <span className="expense-amount">
          ₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
        <span className="expense-date">{formatDate(expense.date)}</span>
      </div>

      <button
        className="delete-btn"
        onClick={() => onDelete(expense.id)}
        title="Delete expense"
        aria-label="Delete expense"
      >
        ×
      </button>
    </div>
  );
}