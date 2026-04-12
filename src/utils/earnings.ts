// 연봉 → 세후 월급 계산 (간이세액표 기반 근사치)
export function calcNetMonthly(annualGross: number): number {
  const monthly = annualGross / 12;
  const pension = monthly * 0.045;          // 국민연금 4.5%
  const health = monthly * 0.03545;         // 건강보험 3.545%
  const ltCare = health * 0.1281;           // 장기요양 12.81%
  const employment = monthly * 0.009;       // 고용보험 0.9%
  const totalInsurance = pension + health + ltCare + employment;

  // 소득세 간이세액 근사 (월급여 기준)
  let incomeTax = 0;
  if (monthly <= 1060000) incomeTax = 0;
  else if (monthly <= 1500000) incomeTax = (monthly - 1060000) * 0.06;
  else if (monthly <= 3000000) incomeTax = 26400 + (monthly - 1500000) * 0.15;
  else if (monthly <= 4500000) incomeTax = 251400 + (monthly - 3000000) * 0.24;
  else if (monthly <= 8800000) incomeTax = 611400 + (monthly - 4500000) * 0.35;
  else incomeTax = 2116400 + (monthly - 8800000) * 0.38;

  const localTax = incomeTax * 0.1;
  return Math.round(monthly - totalInsurance - incomeTax - localTax);
}

// 분당 수입 (세후 월급 기준, 월 22 근무일, 하루 workHours 기준)
export function calcPerMinute(netMonthly: number, workHours: number): number {
  const workingDays = 22;
  const dailyWage = netMonthly / workingDays;
  return dailyWage / (workHours * 60);
}
