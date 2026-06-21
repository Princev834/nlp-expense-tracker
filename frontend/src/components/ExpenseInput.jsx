import { useState } from 'react';
import { parseExpense, parseAndSave } from '../services/api';
import { getCategoryMeta } from '../utils/categoryConfig';

const EXAMPLES = [
  'Spent ₹300 on food yesterday',
  'Uber cab 180 today',
  'Netflix 649 this month',
  'Bought medicines 350',
  '1.5k Amazon shopping',
];

export default function ExpenseInput({ onExpenseAdded }) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed,  setParsed]  = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setParsed(null);
    setError(null);
    setSuccess(false);
  };

  const handleParse = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    reset();

    try {
      const res = await parseExpense(trimmed);
      setParsed(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'object') {
        setError(detail.message || 'Could not understand this expense.');
      } else {
        setError(detail || 'Something went wrong. Is the server running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await parseAndSave(text.trim());

      if (onExpenseAdded) onExpenseAdded(res.data);

      setSuccess(true);
      setTimeout(() => {
        setText('');
        reset();
      }, 1600);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && !saving) handleParse();
  };

  const fillExample = (ex) => {
    setText(ex);
    reset();
  };

  const formatAmount = (n) =>
    n?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—';

  const formatDate = (str) => {
    if (!str) return '—';
    const today = new Date();
    const d     = new Date(str + 'T00:00:00');
    const diff  = Math.round((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const meta = parsed ? getCategoryMeta(parsed.category) : null;

  return (
    <div className="input-section">
      <h1 className="input-heading">What did you spend on?</h1>
      <p className="input-subtitle">
        Type naturally in English or Hinglish — AI does the rest
      </p>

      <div className="input-row">
        <input
          className="nl-input"
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); reset(); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Spent ₹450 on Swiggy last Friday"
          autoFocus
          disabled={saving}
        />
        <button
          className="parse-btn"
          onClick={handleParse}
          disabled={loading || saving || !text.trim()}
        >
          {loading
            ? <><div className="spinner" /> Parsing</>
            : 'Parse →'}
        </button>
      </div>

      <div className="example-chips">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="chip" onClick={() => fillExample(ex)}>
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {parsed && !success && (
        <div className="preview-card">
          <div className="preview-label">✦ Here's what I understood</div>

          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-item-label">Amount</span>
              <span className="preview-item-value amount">
                ₹{formatAmount(parsed.amount)}
              </span>
            </div>

            <div className="preview-item">
              <span className="preview-item-label">Category</span>
              <span className="preview-item-value" style={{ color: meta?.color }}>
                {meta?.icon} {parsed.category}
              </span>
            </div>

            <div className="preview-item">
              <span className="preview-item-label">Date</span>
              <span className="preview-item-value">
                {formatDate(parsed.date)}
              </span>
            </div>

            {parsed.merchant && (
              <div className="preview-item">
                <span className="preview-item-label">Merchant</span>
                <span className="preview-item-value">{parsed.merchant}</span>
              </div>
            )}

            <div className="preview-item">
              <span className="preview-item-label">Description</span>
              <span className="preview-item-value" style={{ fontSize: '14px' }}>
                {parsed.description}
              </span>
            </div>
          </div>

          <div className="confidence-row">
            <div className="confidence-track">
              <div
                className="confidence-fill"
                style={{ width: `${parsed.confidence * 100}%` }}
              />
            </div>
            <span className="confidence-text">
              {Math.round(parsed.confidence * 100)}% confident
            </span>
          </div>

          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={reset}>
              ← Edit
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <><div className="spinner" /> Saving</>
                : '✓ Looks right, save it'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="success-banner">
          ✅ Expense saved! Type your next one.
        </div>
      )}
    </div>
  );
}