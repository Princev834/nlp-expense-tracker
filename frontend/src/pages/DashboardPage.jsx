import { useState, useEffect, useCallback } from 'react';
import InsightCard        from '../components/InsightCard';
import CategoryChart      from '../components/CategoryChart';
import DailyChart         from '../components/DailyChart';
import CategoryBreakdown  from '../components/CategoryBreakdown';
import { getCategoryMeta } from '../utils/categoryConfig';
import {
  getMonthlySummary, getDailySummary,
  getInsights, getCurrentBudget,
} from '../services/api';

function buildMonthOptions() {
  const opts = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    opts.push({ value, label });
  }
  return opts;
}

const MONTH_OPTIONS = buildMonthOptions();

const fmt    = (n) => (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtDec = (n) => (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(MONTH_OPTIONS[0].value);
  const [summary,       setSummary]       = useState(null);
  const [dailyData,     setDailyData]     = useState([]);
  const [insights,      setInsights]      = useState(null);
  const [budget,        setBudget]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchData = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, dailyRes, insRes, budRes] = await Promise.all([
        getMonthlySummary(month),
        getDailySummary(month),
        getInsights(),
        getCurrentBudget(),
      ]);
      setSummary(sumRes.data);
      setDailyData(dailyRes.data);
      setInsights(insRes.data);
      setBudget(budRes.data);
    } catch (err) {
      setError('Could not load dashboard data. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(selectedMonth); }, [selectedMonth, fetchData]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="dash-loading">
          <div
            className="spinner"
            style={{ width: 32, height: 32, borderTopColor: 'var(--accent)' }}
          />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="dash-error">⚠️ {error}</div>
      </div>
    );
  }

  const currentTotal = insights?.current_month_total ?? 0;
  const lastTotal    = insights?.last_month_total    ?? 0;
  const topCat       = insights?.highest_category    ?? 'None';
  const topMeta      = getCategoryMeta(topCat);
  const avgDaily     = insights?.average_daily       ?? 0;
  const trendMsg     = insights?.trend_message       ?? '';

  const trendGood    = currentTotal <= lastTotal;
  const trendColor   = trendGood ? 'var(--success)' : 'var(--danger)';

  const pctUsed      = budget?.percentage_used ?? 0;
  const budgetColor  =
    pctUsed >= 100 ? 'var(--danger)' :
    pctUsed >= 80  ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="page-content">

      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Dashboard</h1>
        <select
          className="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {MONTH_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="insight-grid">

        <InsightCard
          icon="₹"
          iconBg="rgba(16,185,129,0.15)"
          iconColor="var(--success)"
          value={`₹${fmt(currentTotal)}`}
          label="Spent this month"
          trend={trendMsg}
          trendColor={trendColor}
        />

        <InsightCard
          icon={trendGood ? '↓' : '↑'}
          iconBg={trendGood ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
          iconColor={trendGood ? 'var(--success)' : 'var(--danger)'}
          value={`₹${fmt(lastTotal)}`}
          label="Last month total"
          trend={trendGood ? 'Spending is down ✓' : 'Spending is up'}
          trendColor={trendColor}
        />

        <InsightCard
          icon={topMeta.icon}
          iconBg={topMeta.bg}
          iconColor={topMeta.color}
          value={topCat === 'None' ? '—' : topCat.split(' ')[0]}
          label="Top category"
          subValue={insights?.highest_amount ? `₹${fmt(insights.highest_amount)}` : ''}
        />

        <InsightCard
          icon="📅"
          iconBg="rgba(99,102,241,0.15)"
          iconColor="var(--accent)"
          value={`₹${fmt(avgDaily)}`}
          label="Daily average"
          trend={
            budget?.total_budget
              ? `Budget: ₹${fmt(budget.total_budget)} · ${pctUsed.toFixed(0)}% used`
              : 'No budget set'
          }
          trendColor={budgetColor}
        />
      </div>

      <div className="charts-row">

        <div className="chart-card">
          <p className="chart-title">Spending by Category</p>
          <CategoryChart summary={summary} />
        </div>

        <div className="chart-card">
          <p className="chart-title">Daily Spending Trend</p>
          <DailyChart dailyData={dailyData} />
        </div>
      </div>

      <CategoryBreakdown summary={summary} />

      {budget?.total_budget && (
        <div className="chart-card" style={{ marginBottom: '24px' }}>
          <p className="chart-title">Monthly Budget</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              ₹{fmt(budget.spent)} spent
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              ₹{fmt(budget.total_budget)} budget
            </span>
          </div>

          <div className="budget-track">
            <div
              className={`budget-fill ${pctUsed >= 100 ? 'danger' : pctUsed >= 80 ? 'warning' : ''}`}
              style={{ width: `${Math.min(pctUsed, 100)}%` }}
            />
          </div>

          <div
            style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '10px', fontSize: '13px',
            }}
          >
            <span style={{ color: budgetColor, fontWeight: 600 }}>
              {budget.status === 'over_budget' ? '🔴 Over budget!' :
               budget.status === 'warning'     ? '🟡 Approaching limit' :
                                                 '🟢 On track'}
            </span>
            <span style={{ color: 'var(--muted)' }}>{budget.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}