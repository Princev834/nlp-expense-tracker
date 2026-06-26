import { Doughnut } from 'react-chartjs-2';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';

export const THEME_COLORS = [
  '#6366F1',
  '#14B8A6',
  '#F59E0B',
  '#F43F5E', 
  '#8B5CF6',
  '#0EA5E9',
];

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;

    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;

    const total = data.datasets[0].data.reduce((a, v) => a + v, 0);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `700 22px ${MONO}`;
    ctx.fillStyle = '#F5F5F5';
    ctx.fillText(
      `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      cx, cy - 10
    );

    ctx.font = `500 10px ${MONO}`;
    ctx.fillStyle = '#555';
    ctx.letterSpacing = '0.12em';
    ctx.fillText('TOTAL', cx, cy + 13);

    ctx.restore();
  },
};

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '74%',
  layout: { padding: 6 },
  animation: {
    animateRotate: true,
    duration: 700,
    easing: 'easeInOutQuart',
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111111',
      borderColor: '#2A2A2A',
      borderWidth: 1,
      titleColor: '#555555',
      titleFont: { family: MONO, size: 10, weight: '600' },
      bodyColor: '#F5F5F5',
      bodyFont: { family: MONO, size: 13 },
      padding: 12,
      displayColors: true,
      boxPadding: 6,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return `  ₹${ctx.raw.toLocaleString('en-IN')}  ·  ${((ctx.raw / total) * 100).toFixed(1)}%`;
        },
      },
    },
  },
};

export default function CategoryChart({ summary }) {
  if (!summary?.by_category?.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: '#333', fontFamily: MONO, letterSpacing: '0.12em', gap: '8px',
      }}>
        <span style={{ fontSize: '22px', opacity: 0.4 }}>[ ∅ ]</span>
        <span style={{ fontSize: '11px', color: '#444' }}>NO DATA</span>
      </div>
    );
  }

  const categories = summary.by_category;
  const total = categories.reduce((a, c) => a + c.total, 0);

  const chartData = {
    labels: categories.map(c => c.category),
    datasets: [{
      data: categories.map(c => c.total),
      backgroundColor: categories.map((_, i) => THEME_COLORS[i % THEME_COLORS.length]),
      borderWidth: 0,
      borderRadius: 10,
      spacing: 5,
      hoverOffset: 10,
      hoverBorderWidth: 0,
    }],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ height: '210px', flexShrink: 0 }}>
        <Doughnut data={chartData} options={OPTIONS} plugins={[centerTextPlugin]} />
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        paddingBottom: '4px',
      }}>
        {categories.map((c, i) => {
          const color = THEME_COLORS[i % THEME_COLORS.length];
          const pct = ((c.total / total) * 100).toFixed(0);
          return (
            <div key={c.category} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: `${color}14`,
              border: `1px solid ${color}30`,
              fontFamily: MONO,
              fontSize: '10px',
              color: '#AAAAAA',
              letterSpacing: '0.05em',
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }} />
              <span style={{ color: '#777', textTransform: 'uppercase' }}>{c.category}</span>
              <span style={{ color: color, fontWeight: '600' }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}