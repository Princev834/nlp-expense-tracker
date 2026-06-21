import { Doughnut } from 'react-chartjs-2';

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;

    const cx = (chartArea.left + chartArea.right)  / 2;
    const cy = (chartArea.top  + chartArea.bottom) / 2;

    const total = data.datasets[0].data.reduce((acc, v) => acc + v, 0);

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font      = '700 16px Inter, sans-serif';
    ctx.fillStyle = '#F1F5F9';
    ctx.fillText(
      `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      cx, cy - 9
    );

    ctx.font      = '400 11px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Total', cx, cy + 11);

    ctx.restore();
  },
};

const OPTIONS = {
  responsive:          true,
  maintainAspectRatio: false,
  cutout:              '68%',
  plugins: {
    legend: {
      display:  false,
    },
    tooltip: {
      backgroundColor: '#1E293B',
      borderColor:     '#334155',
      borderWidth:     1,
      titleColor:      '#F1F5F9',
      bodyColor:       '#94A3B8',
      padding:         10,
      callbacks: {
        label: (ctx) => {
          const pct = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return ` ₹${ctx.raw.toLocaleString('en-IN')}  (${((ctx.raw / pct) * 100).toFixed(1)}%)`;
        },
      },
    },
  },
};

export default function CategoryChart({ summary }) {

  if (!summary || !summary.by_category || summary.by_category.length === 0) {
    return (
      <div className="no-chart-data">
        <span style={{ fontSize: '28px' }}>🗂️</span>
        No expenses for this month
      </div>
    );
  }

  const categories = summary.by_category;

  const chartData = {
    labels: categories.map(c => c.category),
    datasets: [{
      data:            categories.map(c => c.total),
      backgroundColor: categories.map(c => c.color + 'BB'),  
      borderColor:     categories.map(c => c.color),
      borderWidth:     2,
      hoverBorderWidth: 3,
      hoverOffset:     6,
    }],
  };

  return (
    <div className="doughnut-wrap">
      <Doughnut
        data={chartData}
        options={OPTIONS}
        plugins={[centerTextPlugin]}
      />
    </div>
  );
}