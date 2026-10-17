import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData, saveData } from '../utils/storage';
import { calcNetMonthly } from '../utils/earnings';

const STORAGE_KEY = 'work_dashboard_settings';

interface Settings {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  annualSalary: number;
  netMonthly: number;
  payDay: number;
  fixedExpense: number;
}

const DEFAULT_SETTINGS: Settings = {
  startHour: 9, startMin: 0,
  endHour: 18, endMin: 0,
  annualSalary: 3600,
  netMonthly: 0,
  payDay: 25,
  fixedExpense: 0,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setS(loadData<Settings>(STORAGE_KEY, DEFAULT_SETTINGS));
  }, []);

  function update(key: keyof Settings, value: number) {
    setS(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveData(STORAGE_KEY, s);
    navigate('/');
  }

  const autoNet = Math.round(calcNetMonthly(s.annualSalary * 10000) / 10000);
  const displayNet = s.netMonthly > 0 ? s.netMonthly : autoNet;

  return (
    <div style={{ background: '#F0F4FF', minHeight: '100vh', paddingBottom: 40 }}>
      {/* 헤더 */}
      <div style={{
        background: '#1E40AF',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>설정</span>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* 근무 시간 */}
        <Section title="근무 시간">
          <Row label="출근 시간">
            <TimeInput
              hour={s.startHour} min={s.startMin}
              onChangeHour={v => update('startHour', v)}
              onChangeMin={v => update('startMin', v)}
            />
          </Row>
          <Row label="퇴근 시간">
            <TimeInput
              hour={s.endHour} min={s.endMin}
              onChangeHour={v => update('endHour', v)}
              onChangeMin={v => update('endMin', v)}
            />
          </Row>
        </Section>

        {/* 급여 정보 */}
        <Section title="급여 정보">
          <Row label="연봉 (만원)">
            <NumberInput value={s.annualSalary} onChange={v => update('annualSalary', v)} placeholder="3600" />
          </Row>
          <Row label={`예상 세후 월급`}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1E40AF' }}>
              약 {displayNet.toLocaleString()}만원
            </span>
          </Row>
          <Row label="실수령 직접입력 (선택)">
            <NumberInput value={s.netMonthly || 0} onChange={v => update('netMonthly', v)} placeholder="0 = 자동계산" />
          </Row>
          <Row label="월급날">
            <NumberInput value={s.payDay} onChange={v => update('payDay', Math.min(31, Math.max(1, v)))} placeholder="25" />
          </Row>
          <Row label="고정지출 (만원)">
            <NumberInput value={s.fixedExpense || 0} onChange={v => update('fixedExpense', v)} placeholder="0" />
          </Row>
        </Section>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: '#1E40AF',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '16px 0',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </p>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(30,64,175,0.06)' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function TimeInput({ hour, min, onChangeHour, onChangeMin }: {
  hour: number; min: number;
  onChangeHour: (v: number) => void;
  onChangeMin: (v: number) => void;
}) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="number" min={0} max={23} value={hour}
        onChange={e => onChangeHour(Number(e.target.value))}
        style={inputStyle}
      />
      <span style={{ color: '#6B7280', fontWeight: 700 }}>:</span>
      <input
        type="number" min={0} max={59} value={pad(min)}
        onChange={e => onChangeMin(Number(e.target.value))}
        style={inputStyle}
      />
    </div>
  );
}

function NumberInput({ value, onChange, placeholder }: {
  value: number; onChange: (v: number) => void; placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(Number(e.target.value))}
      style={{ ...inputStyle, width: 100, textAlign: 'right' }}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: 52,
  padding: '6px 8px',
  fontSize: 15,
  fontWeight: 700,
  color: '#111827',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8,
  textAlign: 'center',
  background: '#F9FAFB',
  outline: 'none',
};
