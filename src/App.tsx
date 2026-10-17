import { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { graniteEvent, closeView } from '@apps-in-toss/web-framework';
import IndexPage from './pages/index';
import SettingsPage from './pages/settings';

// 내비게이션 바 뒤로가기: 대시보드(첫 화면)면 미니앱 종료, 설정에선 대시보드로 (앱 자체 뒤로 버튼은 두지 않음)
function BackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;
  useEffect(() => {
    try {
      const cleanup = graniteEvent.addEventListener('backEvent', {
        onEvent: () => {
          if (pathRef.current === '/' || pathRef.current === '') void closeView();
          else navigate('/', { replace: true });
        },
      });
      return () => { cleanup?.(); };
    } catch { return undefined; }
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <BackHandler />
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  );
}
