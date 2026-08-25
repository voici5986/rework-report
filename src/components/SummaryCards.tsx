import { money, percent } from '../lib/format';
import type { ReportTotals } from '../types/report';

interface SummaryCardsProps {
  totals: ReportTotals;
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const employeeCost = totals.normalCost + totals.otCost;
  const averageHours = totals.workedDays ? Math.round(totals.employeeHours / totals.workedDays) : 0;

  return (
    <section className="kpis">
      <div className="kpi">
        <div className="kpi-label">返工员工总工时</div>
        <div className="kpi-value">{totals.employeeHours.toLocaleString('en-US')}<span className="unit">小时</span></div>
        <div className="kpi-sub">{totals.workedDays} 个工作日 · 日均 {averageHours} 小时</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">监工总工时</div>
        <div className="kpi-value">{totals.supervisorHours.toLocaleString('en-US')}<span className="unit">小时</span></div>
        <div className="kpi-sub">覆盖 {totals.supervisorDays} 天</div>
      </div>
      <div className="kpi">
        <div className="kpi-label">返工员工工资</div>
        <div className="kpi-value">{money(employeeCost)}</div>
        <div className="kpi-sub">正常 {money(totals.normalCost)} + 加班 {money(totals.otCost)}</div>
      </div>
      <div className="kpi primary">
        <div className="kpi-label">总人工成本</div>
        <div className="kpi-value">{money(totals.total)}</div>
        <div className="kpi-sub">
          员工工资 {percent(employeeCost, totals.total).toFixed(1)}% + 监工工资 {percent(totals.supervisorCost, totals.total).toFixed(1)}%
        </div>
      </div>
    </section>
  );
}
