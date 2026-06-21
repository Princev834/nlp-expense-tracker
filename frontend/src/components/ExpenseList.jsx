import ExpenseCard from './ExpenseCard';
import { deleteExpense } from '../services/api';

export default function ExpenseList({ expenses, setExpenses, loading }) {

  const handleDelete = async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    try {
      await deleteExpense(id);
    } catch {
      alert('Could not delete expense. Please refresh.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)' }}>
        <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--accent)' }} />
        <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading expenses…</p>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧾</div>
        <div className="empty-title">No expenses yet</div>
        <div className="empty-text">
          Type your first expense above — try "Spent ₹200 on lunch today"
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-section">
      <div className="list-header">
        <p className="section-title">Recent Expenses</p>
        <span className="expense-count">{expenses.length} entries</span>
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