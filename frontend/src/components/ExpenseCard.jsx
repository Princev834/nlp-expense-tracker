import { useState } from 'react';
import { getCategoryMeta } from '../utils/categoryConfig';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

const SLOT_COLORS = ['#6366F1','#14B8A6','#F59E0B','#F43F5E','#8B5CF6','#0EA5E9'];
const categoryColorMap = {};
let colorIndex = 0;
function getSlotColor(category) {
  if (!categoryColorMap[category]) {
    categoryColorMap[category] = SLOT_COLORS[colorIndex % SLOT_COLORS.length];
    colorIndex++;
  }
  return categoryColorMap[category];
}

function formatDate(str) {
  if (!str) return '';
  const today = new Date();
  const d     = new Date(str + 'T00:00:00');
  const diff  = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase();
}

export default function ExpenseCard({ expense, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const meta      = getCategoryMeta(expense.category);
  const slotColor = getSlotColor(expense.category);

  const handleDeleteClick = () => {
    setConfirming(true);
  };

  const handleConfirm = () => {
    onDelete(expense.id);
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  return (
    <div className="expense-card">

      <div
        className="expense-icon-wrap"
        style={{
          background: `${slotColor}14`,
          border: `1px solid ${slotColor}28`,
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          fontSize: '17px',
          flexShrink: 0,
        }}
      >
        {meta.icon}
      </div>

      <div className="expense-info">
        <div className="expense-desc">
          {expense.description || expense.category}
        </div>
        <div className="expense-meta">
          <span className="expense-category-dot" style={{ background: slotColor }} />
          <span style={{ color: slotColor, fontFamily: MONO, fontSize: '11px' }}>
            {expense.category}
          </span>
          {expense.merchant && (
            <>
              <span style={{ color: '#2A2A2A' }}> · </span>
              <span style={{ color: '#444', fontFamily: MONO, fontSize: '11px' }}>
                {expense.merchant}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="expense-right">
        <span className="expense-amount" style={{ fontFamily: MONO, fontSize: '15px' }}>
          ₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
        <span className="expense-date" style={{ fontFamily: MONO, fontSize: '10px', color: '#333', letterSpacing: '0.08em' }}>
          {formatDate(expense.date)}
        </span>
      </div>

      {confirming ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: '10px', color: '#555', letterSpacing: '0.06em' }}>
            sure?
          </span>
          <button
            onClick={handleConfirm}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(225,29,72,0.12)',
              border: '1px solid rgba(225,29,72,0.4)',
              color: 'var(--danger)',
              fontFamily: MONO,
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            YES
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'transparent',
              border: '1px solid #222',
              color: '#555',
              fontFamily: MONO,
              fontSize: '10px',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            NO
          </button>
        </div>
      ) : (
        <button
          className="delete-btn"
          onClick={handleDeleteClick}
          title="Delete expense"
          aria-label="Delete expense"
        >
          ×
        </button>
      )}

    </div>
  );
}