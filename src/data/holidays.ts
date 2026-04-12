// 한국 공휴일 (2026~2027)
export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export const HOLIDAYS: Holiday[] = [
  // 2026
  { date: '2026-01-01', name: '신정' },
  { date: '2026-01-28', name: '설날 연휴' },
  { date: '2026-01-29', name: '설날' },
  { date: '2026-01-30', name: '설날 연휴' },
  { date: '2026-03-01', name: '삼일절' },
  { date: '2026-05-05', name: '어린이날' },
  { date: '2026-05-24', name: '부처님오신날' },
  { date: '2026-06-06', name: '현충일' },
  { date: '2026-08-15', name: '광복절' },
  { date: '2026-09-24', name: '추석 연휴' },
  { date: '2026-09-25', name: '추석' },
  { date: '2026-09-26', name: '추석 연휴' },
  { date: '2026-10-03', name: '개천절' },
  { date: '2026-10-09', name: '한글날' },
  { date: '2026-12-25', name: '크리스마스' },
  // 2027
  { date: '2027-01-01', name: '신정' },
  { date: '2027-02-16', name: '설날 연휴' },
  { date: '2027-02-17', name: '설날' },
  { date: '2027-02-18', name: '설날 연휴' },
  { date: '2027-03-01', name: '삼일절' },
  { date: '2027-05-05', name: '어린이날' },
  { date: '2027-06-06', name: '현충일' },
  { date: '2027-08-15', name: '광복절' },
  { date: '2027-10-03', name: '개천절' },
  { date: '2027-10-09', name: '한글날' },
  { date: '2027-12-25', name: '크리스마스' },
];

export function getNextHoliday(): Holiday | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return HOLIDAYS.find(h => new Date(h.date) >= today) ?? null;
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
