import { describe, expect, it } from 'vitest';
import type { ReportState, ReworkRow, WageRates } from '../types/report';
import { calculateRow, calculateTotals } from './calculations';

const RATES: WageRates = {
  normal: 50,
  ot: 65,
  supervisor: 250,
};

const FIRST_ROW: ReworkRow = {
  id: 'first',
  date: '2026-08-29',
  workers: 12,
  normalHours: 3,
  otHours: 2,
  supervisorPeople: 1,
  supervisorHours: 5,
};

describe('calculateRow', () => {
  it('calculates employee and supervisor costs from one worked example', () => {
    expect(calculateRow(FIRST_ROW, RATES)).toEqual({
      employeeHours: 60,
      normalCost: 1_800,
      otCost: 1_560,
      supervisorCost: 1_250,
      total: 4_610,
    });
  });
});

describe('calculateTotals', () => {
  it('aggregates costs, hours, and worked-day counts', () => {
    const report: ReportState = {
      projectName: '验证项目',
      reportTitle: '返工报告',
      subtitle: '',
      rates: RATES,
      rows: [
        FIRST_ROW,
        {
          id: 'second',
          date: '2026-08-30',
          workers: 8,
          normalHours: 2,
          otHours: 0,
          supervisorPeople: 0,
          supervisorHours: 0,
        },
      ],
    };

    expect(calculateTotals(report)).toEqual({
      employeeHours: 76,
      normalCost: 2_600,
      otCost: 1_560,
      supervisorCost: 1_250,
      total: 5_410,
      supervisorHours: 5,
      workedDays: 2,
      supervisorDays: 1,
    });
  });

  it('returns zero totals for an empty report', () => {
    expect(
      calculateTotals({
        projectName: '',
        reportTitle: '',
        subtitle: '',
        rates: RATES,
        rows: [],
      }),
    ).toEqual({
      employeeHours: 0,
      normalCost: 0,
      otCost: 0,
      supervisorCost: 0,
      total: 0,
      supervisorHours: 0,
      workedDays: 0,
      supervisorDays: 0,
    });
  });
});
