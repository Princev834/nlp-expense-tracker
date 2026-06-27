import { useState } from 'react';
import { parseExpense, parseAndSave } from '../services/api';
import { getCategoryMeta } from '../utils/categoryConfig';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

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

  const reset = () => { setParsed(null); setError(null); setSuccess(false); };

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
      setError(typeof detail === 'object'
        ? detail.message || 'Could not understand this expense.'
        : detail || 'Something went wrong. Is the server running?'
      );
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
      setTimeout(() => { setText(''); reset(); }, 1600);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && !saving) handleParse();
  };

  const fillExample = (ex) => { setText(ex); reset(); };

  const formatAmount = (n) =>
    n?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) ?? '—';

  const formatDate = (str) => {
    if (!str) return '—';
    const today = new Date();
    const d = new Date(str + 'T00:00:00');
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const meta = parsed ? getCategoryMeta(parsed.category) : null;

  return (
    <div className="input-section">

      <h1 style={{
        fontFamily: MONO,
        fontSize: '32px',
        fontWeight: '700',
        letterSpacing: '-0.03em',
        color: 'var(--text-main)',
        marginBottom: '10px',
        lineHeight: 1.2,
      }}>
        What did you spend on?
      </h1>

      <p style={{
        fontFamily: MONO,
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginBottom: '28px',
        letterSpacing: '0.04em',
      }}>
        Type naturally in English or Hinglish · AI does the rest
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
            ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner" style={{ borderColor: '#33333340', borderTopColor: '#000000' }} />
                Parsing
              </span>
            )
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

      {error && <div className="error-banner">⚠ {error}</div>}

      {parsed && !success && (
        <div className="preview-card" style={{
          borderTop: '1px solid var(--border-subtle)',
          borderLeft: '2px solid var(--success)',
          background: '#0A0A0A',
        }}>

          {/* Header */}
          <div className="preview-label" style={{
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: '#333',
            marginBottom: '20px',
          }}>
            ✦ HERE'S WHAT I UNDERSTOOD
          </div>

          {/* Single row — Amount, Category, Date, Merchant (optional), Description */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: parsed.merchant
              ? '0.6fr 1fr 0.8fr 0.8fr 1.4fr'
              : '0.6fr 1fr 0.8fr 1.6fr',
            gap: '24px',
            marginBottom: '20px',
            alignItems: 'start',
          }}>
            <div className="preview-item">
              <span className="preview-item-label">Amount</span>
              <span className="preview-item-value amount">
                ₹{formatAmount(parsed.amount)}
              </span>
            </div>

            <div className="preview-item">
              <span className="preview-item-label">Category</span>
              <span className="preview-item-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: meta?.bg,
                  fontSize: '13px',
                  flexShrink: 0,
                }}>
                  {meta?.icon}
                </span>
                <span style={{ color: meta?.color, fontFamily: MONO, fontSize: '13px' }}>
                  {parsed.category}
                </span>
              </span>
            </div>

            <div className="preview-item">
              <span className="preview-item-label">Date</span>
              <span className="preview-item-value">{formatDate(parsed.date)}</span>
            </div>

            {parsed.merchant && (
              <div className="preview-item">
                <span className="preview-item-label">Merchant</span>
                <span className="preview-item-value">{parsed.merchant}</span>
              </div>
            )}

            {parsed.description && (
              <div className="preview-item">
                <span className="preview-item-label">Description</span>
                <span className="preview-item-value" style={{ fontSize: '13px' }}>
                  {parsed.description}
                </span>
              </div>
            )}
          </div>


          {/* Confidence bar */}
          <div className="confidence-row">
            <div className="confidence-track">
              <div
                className="confidence-fill"
                style={{ width: `${parsed.confidence * 100}%` }}
              />
            </div>
            <span className="confidence-text" style={{ fontFamily: MONO, fontSize: '10px', color: '#444' }}>
              {Math.round(parsed.confidence * 100)}% confident
            </span>
          </div>

          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={reset}>← Edit</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner" /> Saving</span>
                : '✓ Looks right, save it'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="success-banner">✓ Expense saved! Type your next one.</div>
      )}
    </div>
  );
}