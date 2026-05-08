import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData } from '../utils/storage';
import { calcNetMonthly, calcPerMinute } from '../utils/earnings';
import { getNextHoliday, getDaysUntil } from '../data/holidays';
import { BannerAd, showInterstitialAd } from '../utils/ads';

const STORAGE_KEY = 'work_dashboard_settings';

interface Settings {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  annualSalary: number;  // 만원
  netMonthly: number;    // 만원 (0이면 자동계산)
  payDay: number;        // 1~31
  fixedExpense: number;  // 만원
}

const DEFAULT_SETTINGS: Settings = {
  startHour: 9, startMin: 0,
  endHour: 18, endMin: 0,
  annualSalary: 3600,
  netMonthly: 0,
  payDay: 25,
  fixedExpense: 0,
};

export default function IndexPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [now, setNow] = useState(new Date());
  const [showShare, setShowShare] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);

  useEffect(() => {
    setSettings(loadData<Settings>(STORAGE_KEY, DEFAULT_SETTINGS));
    // 하루 1회 전면광고
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem('work_dashboard_ad_date');
    if (lastShown !== today) {
      localStorage.setItem('work_dashboard_ad_date', today);
      showInterstitialAd();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { startHour, startMin, endHour, endMin, annualSalary, netMonthly, payDay, fixedExpense } = settings;

  // 세후 월급
  const effectiveNet = netMonthly > 0 ? netMonthly * 10000 : calcNetMonthly(annualSalary * 10000);
  const workHours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
  const perMinute = calcPerMinute(effectiveNet, workHours);

  // 퇴근까지 카운트다운
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  const nowTotalMin = now.getHours() * 60 + now.getMinutes();
  const nowTotalSec = nowTotalMin * 60 + now.getSeconds();
  const endTotalSec = endTotalMin * 60;
  const startTotalSec = startTotalMin * 60;
  const workTotalSec = endTotalSec - startTotalSec;

  const isWorking = nowTotalMin >= startTotalMin && nowTotalMin < endTotalMin;
  const isAfterWork = nowTotalMin >= endTotalMin;

  let remainSec = isAfterWork ? 0 : Math.max(0, endTotalSec - nowTotalSec);
  const rh = Math.floor(remainSec / 3600);
  const rm = Math.floor((remainSec % 3600) / 60);
  const rs = remainSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const countdownStr = isAfterWork ? '퇴근했어요' : `${pad(rh)}:${pad(rm)}:${pad(rs)}`;

  // 진행률
  const elapsed = Math.max(0, nowTotalSec - startTotalSec);
  const progress = isAfterWork ? 100 : isWorking ? Math.min(100, (elapsed / workTotalSec) * 100) : 0;

  // 번 돈
  const earnedSec = isAfterWork ? workTotalSec : Math.max(0, nowTotalSec - startTotalSec);
  const earnedMin = earnedSec / 60;
  const earned = isWorking || isAfterWork ? Math.round(earnedMin * perMinute) : 0;
  const perMinuteRounded = Math.round(perMinute);

  // 월급날 D-day
  const today = now.getDate();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let nextPayDate = new Date(thisYear, thisMonth, payDay);
  if (today > payDay) nextPayDate = new Date(thisYear, thisMonth + 1, payDay);
  const daysToPayday = Math.ceil((nextPayDate.getTime() - new Date(thisYear, thisMonth, today).getTime()) / (1000 * 60 * 60 * 24));

  // 오늘 쓸 수 있는 돈
  const netMonthlyVal = effectiveNet;
  const remainingBudget = Math.max(0, netMonthlyVal - fixedExpense * 10000);
  const remainingDays = daysToPayday > 0 ? daysToPayday : 30;
  const dailyBudget = Math.round(remainingBudget / remainingDays);

  // 다음 공휴일
  const nextHoliday = getNextHoliday();
  const holidayDays = nextHoliday ? getDaysUntil(nextHoliday.date) : null;

  // 이번달 근무일
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  let workDaysTotal = 0;
  let workDaysSoFar = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(thisYear, thisMonth, d).getDay();
    if (day !== 0 && day !== 6) {
      workDaysTotal++;
      if (d <= today) workDaysSoFar++;
    }
  }

  function formatWon(n: number) {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}천만원`;
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
    return `${n.toLocaleString()}원`;
  }

  async function handleShare() {
    const text = `지금까지 번 돈 ${earned.toLocaleString()}원\n분당 ${perMinuteRounded.toLocaleString()}원 벌고 있어요\n\n직장인 대시보드에서 확인해보세요`;
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch {}
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000);
  }

  const isSetup = annualSalary > 0;

  return (
    <div style={{ background: '#F0F4FF', minHeight: '100vh', paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{
        background: '#1E40AF',
        padding: '20px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff' }}>직장인 대시보드</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          설정
        </button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* 퇴근 카운트다운 Hero */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px 24px',
          marginBottom: 14,
          boxShadow: '0 2px 12px rgba(30,64,175,0.08)',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
            {isAfterWork ? '오늘 하루도 수고했어요' : isWorking ? '퇴근까지' : '출근 전'}
          </p>
          <p style={{
            margin: '0 0 16px',
            fontSize: isAfterWork ? 32 : 44,
            fontWeight: 800,
            color: '#1E40AF',
            letterSpacing: isAfterWork ? 0 : 2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {countdownStr}
          </p>
          {/* 프로그레스 바 */}
          <div style={{ background: '#EFF6FF', borderRadius: 6, height: 6, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(90deg, #3B82F6, #1E40AF)',
              height: '100%',
              width: `${progress}%`,
              borderRadius: 6,
              transition: 'width 1s linear',
            }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9CA3AF' }}>
            {startHour}:{pad(startMin)} 출근 · {endHour}:{pad(endMin)} 퇴근
          </p>
        </div>

        {/* 번 돈 */}
        <div style={{
          background: '#1E40AF',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 14,
          boxShadow: '0 4px 16px rgba(30,64,175,0.25)',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {isSetup ? '지금까지 번 돈' : '연봉을 설정해주세요'}
          </p>
          <p style={{
            margin: '0 0 4px',
            fontSize: 38,
            fontWeight: 800,
            color: '#fff',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {isSetup ? `${earned.toLocaleString()}원` : '—'}
          </p>
          {isSetup && (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              분당 {perMinuteRounded.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 정보 카드 2열 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {/* 월급 D-day */}
          <InfoCard
            label="월급까지"
            value={daysToPayday === 0 ? '오늘!' : `D-${daysToPayday}`}
            sub={`매월 ${payDay}일`}
          />
          {/* 다음 공휴일 */}
          <InfoCard
            label={nextHoliday?.name ?? '공휴일'}
            value={holidayDays === 0 ? '오늘!' : holidayDays === 1 ? '내일' : `D-${holidayDays}`}
            sub={nextHoliday?.date.slice(5).replace('-', '/') ?? ''}
          />
          {/* 오늘 쓸 수 있는 돈 */}
          <InfoCard
            label="오늘 예산"
            value={isSetup ? formatWon(dailyBudget) : '—'}
            sub="하루 사용 가능"
          />
          {/* 이번달 근무 */}
          <InfoCard
            label="이번달 근무"
            value={`${workDaysSoFar}일`}
            sub={`/ ${workDaysTotal}일`}
          />
        </div>

        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          style={{
            width: '100%',
            background: '#fff',
            border: '1.5px solid #DBEAFE',
            borderRadius: 14,
            padding: '14px 0',
            fontSize: 15,
            fontWeight: 700,
            color: '#1E40AF',
            cursor: 'pointer',
            marginBottom: 10,
          }}
        >
          {showShare ? '클립보드에 복사됐어요' : '결과 공유하기'}
        </button>

        {/* 리워드 광고 버튼 */}
        <button
          onClick={async () => {
            setRewardLoading(true);
            await showInterstitialAd();
            setRewardLoading(false);
          }}
          disabled={rewardLoading}
          style={{
            width: '100%',
            background: rewardLoading ? '#F3F4F6' : '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            borderRadius: 14,
            padding: '14px 0',
            fontSize: 14,
            fontWeight: 600,
            color: rewardLoading ? '#9CA3AF' : '#3B82F6',
            cursor: rewardLoading ? 'default' : 'pointer',
            marginBottom: 20,
          }}
        >
          {rewardLoading ? '광고 불러오는 중...' : '광고 보고 개발자 응원하기'}
        </button>
      </div>

      {/* 하단 배너 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', zIndex: 10 }}>
        <BannerAd />
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '18px 16px',
      boxShadow: '0 2px 8px rgba(30,64,175,0.06)',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#111827' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{sub}</p>
    </div>
  );
}
