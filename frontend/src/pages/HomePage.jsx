import { useState, useEffect, useCallback } from 'react';
import ExpenseInput from '../components/ExpenseInput';
import ExpenseList  from '../components/ExpenseList';
import BudgetBar    from '../components/BudgetBar';
import { getExpenses, getCurrentBudget } from '../services/api';

export default function HomePage() {
  const [expenses,   setExpenses]   = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [loading,    setLoading]    = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, budRes] = await Promise.all([
        getExpenses({ limit: 50 }),
        getCurrentBudget(),
      ]);
      setExpenses(expRes.data);
      setBudgetData(budRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    getCurrentBudget()
      .then(res => setBudgetData(res.data))
      .catch(() => {});
  };

  const handleExpenseDeleted = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    getCurrentBudget()
      .then(res => setBudgetData(res.data))
      .catch(() => {});
  };

  return (
    <div className="page-content">
      <ExpenseInput onExpenseAdded={handleExpenseAdded} />
      <BudgetBar budgetData={budgetData} />
      <ExpenseList
        expenses={expenses}
        loading={loading}
        onExpenseDeleted={handleExpenseDeleted}
      />
    </div>
  );
}