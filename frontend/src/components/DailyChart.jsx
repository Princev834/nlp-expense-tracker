import { Line } from 'react-chartjs-2';
import { useRef } from 'react';

const MONO = '"JetBrains Mono", "Fira Code", "SF Mono", monospace';
const EMERALD = '#10B981';

const buildOptions = (maxVal) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  animation: {
    duration: 500,
    easing: 'easeOutCubic',
  },
  layout: {
    padding: { top: 20, right: 20, bottom: 0, left: 0 },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: '#0D0D0D',
      borderColor: '#222222',
      borderWidth: 1,
      titleColor: '#444444',
      titleFont: { family: MONO, size: 10, weight: '500' },
      bodyColor: EMERALD,
      bodyFont: { family: MONO, size: 14, weight: '700' },
      padding: { top: 10, bottom: 10, left: 14, right: 14 },
      displayColors: false,
      caretSize: 4,
      callbacks: {
        title: (items) => `── DAY ${items[0].label} ──`,
        label: (ctx) => `₹${ctx.raw.toLocaleString('en-IN')}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: '#161616',
        drawBorder: false,
        drawTicks: false,
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: '#2E2E2E',
        font: { size: 10, family: MONO, weight: '500' },
        maxTicksLimit: 8,
        padding: 10,
      },
    },
    y: {
      position: 'left',
      grid: {
        color: '#141414',
        drawBorder: false,
        drawTicks: false,
        lineWidth: 1,
      },
      border: { display: false },
      min: 0,
      suggestedMax: maxVal * 1.3,
      ticks: {
        color: '#2E2E2E',
        font: { size: 10, family: MONO },
        padding: 10,
        maxTicksLimit: 5,
        callback: (val) => {
          if (val === 0) return '₹0';
          return val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`;
        },
      },
    },
  },
});

const peakLabelPlugin = {
  id: 'peakLabel',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = data.datasets[0].data;
    const maxVal = Math.max(...values);

    meta.data.forEach((point, i) => {
      if (values[i] !== maxVal) return;
      ctx.save();
      ctx.font = `600 9px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'center';
      ctx.fillText(
        `₹${values[i].toLocaleString('en-IN')}`,
        point.x,
        point.y - 12
      );
      ctx.restore();
    });
  },
};

export default function DailyChart({ dailyData }) {
  const chartRef = useRef(null);

  if (!dailyData?.length) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: MONO,
      }}>
        <div style={{
          fontSize: '11px',
          color: '#2A2A2A',
          letterSpacing: '0.2em',
          border: '1px solid #1E1E1E',
          padding: '10px 20px',
          borderRadius: '4px',
        }}>
          NO SPENDING DATA
        </div>
      </div>
    );
  }

  const values = dailyData.map(d => d.total);
  const maxVal = Math.max(...values, 1);

  const buildGradient = (ctx, area) => {
    const grad = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    grad.addColorStop(0,    'rgba(16, 185, 129, 0.15)');
    grad.addColorStop(0.5,  'rgba(16, 185, 129, 0.04)');
    grad.addColorStop(1,    'rgba(16, 185, 129, 0.00)');
    return grad;
  };

  const chartData = {
    labels: dailyData.map(d => parseInt(d.date.split('-')[2], 10)),
    datasets: [{
      label: 'Daily Spending',
      data: values,
      borderColor: EMERALD,
      borderWidth: 1.5,

      tension: 0,

      pointStyle: 'rect',
      pointBackgroundColor: values.map(v => v === maxVal ? EMERALD : '#0D0D0D'),
      pointBorderColor: values.map(v => v === maxVal ? EMERALD : '#252525'),
      pointBorderWidth: 1.5,
      pointRadius: values.map(v => v === maxVal ? 5 : 3),
      pointHoverRadius: 6,
      pointHoverBackgroundColor: EMERALD,
      pointHoverBorderColor: '#0D0D0D',
      pointHoverBorderWidth: 2,

      fill: true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(16,185,129,0.08)';
        return buildGradient(ctx, chartArea);
      },
    }],
  };

  return (
    <div style={{ height: '240px', width: '100%', position: 'relative' }}>
      <Line
        ref={chartRef}
        data={chartData}
        options={buildOptions(maxVal)}
        plugins={[peakLabelPlugin]}
      />
    </div>
  );
}