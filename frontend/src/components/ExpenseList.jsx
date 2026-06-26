import ExpenseCard from './ExpenseCard';
import { deleteExpense } from '../services/api';
import { exportExpensesToCSV } from '../utils/exportCSV';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

export default function ExpenseList({ expenses, loading, onExpenseDeleted }) {

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      onExpenseDeleted(id);
    } catch {
      alert('Could not delete expense. Please refresh.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent-invert)' }} />
        <p style={{ marginTop: '12px', fontSize: '11px', fontFamily: MONO, color: '#333', letterSpacing: '0.1em' }}>
          LOADING...
        </p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧾</div>
        <div className="empty-title">No expenses yet</div>
        <div className="empty-text">
          Type your first expense above · try "Spent ₹200 on lunch today"
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-section">
      <div className="list-header">
        <p className="section-title" style={{
          marginBottom: 0,
          borderLeft: '2px solid var(--accent-primary)',
          paddingLeft: '10px',
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: '#333',
        }}>
          RECENT EXPENSES
        </p>
        <div className="list-header-right">
          <span className="expense-count" style={{ fontFamily: MONO, fontSize: '10px', color: '#333', letterSpacing: '0.08em' }}>
            {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
          </span>
          <button
            className="export-btn"
            onClick={() => exportExpensesToCSV(expenses)}
            title="Download all expenses as CSV"
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="expense-list">
        {expenses.map(expense => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}