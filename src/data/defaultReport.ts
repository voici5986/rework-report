import type { ReportState } from '../types/report';

export const DEFAULT_REPORT: ReportState = {
  projectName: '15kg 黄盖 Rework',
  reportTitle: '返工人工成本汇总表',
  subtitle: '口径不含二楼办公室人员',
  rates: {
    normal: 50,
    ot: 65,
    supervisor: 250,
  },
  rows: [
    {
      id: '2026-08-20',
      date: '2026-08-20',
      workers: 15,
      normalHours: 3,
      otHours: 0,
      supervisorPeople: 1,
      supervisorHours: 3,
    },
    {
      id: '2026-08-21',
      date: '2026-08-21',
      workers: 15,
      normalHours: 3,
      otHours: 2,
      supervisorPeople: 1,
      supervisorHours: 5,
    },
    {
      id: '2026-08-22',
      date: '2026-08-22',
      workers: 16,
      normalHours: 3,
      otHours: 2,
      supervisorPeople: 1,
      supervisorHours: 5,
    },
    {
      id: '2026-08-23',
      date: '2026-08-23',
      workers: 15,
      normalHours: 3,
      otHours: 0,
      supervisorPeople: 1,
      supervisorHours: 3,
    },
    {
      id: '2026-08-24',
      date: '2026-08-24',
      workers: 15,
      normalHours: 2,
      otHours: 0,
      supervisorPeople: 0,
      supervisorHours: 0,
    },
  ],
};
