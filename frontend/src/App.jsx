import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar        from './components/Navbar';
import HomePage      from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="demo-banner">
          🎯 This is a <span>shared live demo</span> — sample data auto-resets every 6 hours.
          Try typing any expense in natural language!
        </div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}