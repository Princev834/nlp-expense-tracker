import { useState } from 'react';
import { setBudget } from '../services/api';

function buildMonthOptions() {
  const opts  = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d     = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    opts.push({ value, label });
  }
  return opts;
}

const MONTH_OPTIONS = buildMonthOptions();

export default function BudgetModal({ defaultMonth, onClose, onSaved }) {
  const [month,  setMonth]  = useState(defaultMonth ?? MONTH_OPTIONS[0].value);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await setBudget(month, parsed);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to save budget. Try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-head">
          <h2>💰 Set Monthly Budget</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}>
              {MONTH_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Spending Limit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              min="1"
            />
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !amount}
          >
            {saving
              ? <><div className="spinner" /> Saving…</>
              : '✓ Save Budget'}
          </button>
        </div>
      </div>
    </div>
  );
}