export interface WageRates {
  normal: number;
  ot: number;
  supervisor: number;
}

export interface ReworkRow {
  id: string;
  date: string;
  workers: number;
  normalHours: number;
  otHours: number;
  supervisorPeople: number;
  supervisorHours: number;
}

export interface ReportState {
  projectName: string;
  reportTitle: string;
  subtitle: string;
  rates: WageRates;
  rows: ReworkRow[];
}

export interface RowCalculation {
  employeeHours: number;
  normalCost: number;
  otCost: number;
  supervisorCost: number;
  total: number;
}

export interface ReportTotals {
  employeeHours: number;
  normalCost: number;
  otCost: number;
  supervisorCost: number;
  total: number;
  supervisorHours: number;
  workedDays: number;
  supervisorDays: number;
}
