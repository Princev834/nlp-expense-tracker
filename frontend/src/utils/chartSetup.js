import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

ChartJS.defaults.color         = '#888888';
ChartJS.defaults.borderColor   = '#1F1F1F';
ChartJS.defaults.font.family   = "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";