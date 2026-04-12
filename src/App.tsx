import { HashRouter, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/index';
import SettingsPage from './pages/settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  );
}
