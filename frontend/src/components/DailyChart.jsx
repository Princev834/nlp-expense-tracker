import { Line } from 'react-chartjs-2';
import { useRef } from 'react';

const buildOptions = (maxVal) => ({
  responsive:          true,
  maintainAspectRatio: false,
  interaction: {
    mode:      'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      borderColor:     '#334155',
      borderWidth:     1,
      titleColor:      '#F1F5F9',
      bodyColor:       '#94A3B8',
      padding:         10,
      callbacks: {
        title: (items) => `Day ${items[0].label}`,
        label: (ctx)   => ` ₹${ctx.raw.toLocaleString('en-IN')}`,
      },
    },
  },
  scales: {
    x: {
      grid:  { color: 'rgba(45,63,85,0.5)', drawBorder: false },
      ticks: { color: '#64748B', font: { size: 11, family: 'Inter' }, maxTicksLimit: 10 },
    },
    y: {
      grid:     { color: 'rgba(45,63,85,0.5)', drawBorder: false },
      min:      0,
      suggestedMax: maxVal * 1.2,
      ticks: {
        color:    '#64748B',
        font:     { size: 11, family: 'Inter' },
        callback: (val) =>
          val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`,
      },
    },
  },
});

export default function DailyChart({ dailyData }) {
  const chartRef = useRef(null);

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="no-chart-data">
        <span style={{ fontSize: '28px' }}>📈</span>
        No daily data for this month
      </div>
    );
  }

  const maxVal = Math.max(...dailyData.map(d => d.total), 1);

  const buildGradient = (ctx, area) => {
    const grad = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    grad.addColorStop(0,   'rgba(99,102,241,0.28)');
    grad.addColorStop(0.6, 'rgba(99,102,241,0.08)');
    grad.addColorStop(1,   'rgba(99,102,241,0.01)');
    return grad;
  };

  const chartData = {
    labels: dailyData.map(d => parseInt(d.date.split('-')[2], 10)),
    datasets: [{
      label:            'Daily Spending',
      data:             dailyData.map(d => d.total),
      borderColor:      '#6366F1',
      borderWidth:      2.5,
      pointBackgroundColor: '#6366F1',
      pointBorderColor:     '#0F172A',
      pointBorderWidth:     2,
      pointRadius:          4,
      pointHoverRadius:     6,
      tension:          0.4,
      fill:             true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(99,102,241,0.1)';
        return buildGradient(ctx, chartArea);
      },
    }],
  };

  return (
    <div className="line-wrap">
      <Line
        ref={chartRef}
        data={chartData}
        options={buildOptions(maxVal)}
      />
    </div>
  );
}