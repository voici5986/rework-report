import type { ReportState, ReportTotals, ReworkRow, RowCalculation, WageRates } from '../types/report';

export function calculateRow(row: ReworkRow, rates: WageRates): RowCalculation {
  const employeeHours = row.workers * (row.normalHours + row.otHours);
  const normalCost = row.workers * row.normalHours * rates.normal;
  const otCost = row.workers * row.otHours * rates.ot;
  const supervisorCost = row.supervisorPeople * row.supervisorHours * rates.supervisor;

  return {
    employeeHours,
    normalCost,
    otCost,
    supervisorCost,
    total: normalCost + otCost + supervisorCost,
  };
}

export function calculateTotals(report: ReportState): ReportTotals {
  return report.rows.reduce<ReportTotals>((totals, row) => {
    const calc = calculateRow(row, report.rates);
    totals.employeeHours += calc.employeeHours;
    totals.normalCost += calc.normalCost;
    totals.otCost += calc.otCost;
    totals.supervisorCost += calc.supervisorCost;
    totals.total += calc.total;
    totals.supervisorHours += row.supervisorPeople * row.supervisorHours;
    if (row.workers > 0 && row.normalHours + row.otHours > 0) totals.workedDays += 1;
    if (row.supervisorPeople > 0 && row.supervisorHours > 0) totals.supervisorDays += 1;
    return totals;
  }, {
    employeeHours: 0,
    normalCost: 0,
    otCost: 0,
    supervisorCost: 0,
    total: 0,
    supervisorHours: 0,
    workedDays: 0,
    supervisorDays: 0,
  });
}
