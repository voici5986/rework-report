import { createInitialReportRows } from '../lib/reportRows';
import type { ReportState } from '../types/report';

const EMPTY_ROW_COUNT = 5;

export const DEFAULT_REPORT: ReportState = {
  projectName: '',
  reportTitle: '',
  subtitle: '',
  rates: {
    normal: 0,
    ot: 0,
    supervisor: 0,
  },
  rows: createInitialReportRows(EMPTY_ROW_COUNT),
};
