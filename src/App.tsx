import { useEffect, useMemo, useState } from 'react';
import { CostBreakdown } from './components/CostBreakdown';
import { ReportHeader } from './components/ReportHeader';
import { ReworkTable } from './components/ReworkTable';
import { SummaryCards } from './components/SummaryCards';
import { Toolbar } from './components/Toolbar';
import { WageRates } from './components/WageRates';
import { calculateTotals } from './lib/calculations';
import { periodText } from './lib/format';
import {
  hasReworkRowData,
  normalizeReportRowCount,
  resizeReportRows,
} from './lib/reportRows';
import { loadReport, resetReport, saveReport } from './lib/storage';
import type {
  ReportState,
  ReworkRow,
  WageRates as WageRatesType,
} from './types/report';

export default function App() {
  const [report, setReport] = useState<ReportState>(() => loadReport());
  const totals = useMemo(() => calculateTotals(report), [report]);
  const period = useMemo(
    () => periodText(report.rows.map((row) => row.date)),
    [report.rows],
  );

  useEffect(() => {
    saveReport(report);
  }, [report]);

  function updateMeta(
    key: 'projectName' | 'reportTitle' | 'subtitle',
    value: string,
  ) {
    setReport((current) => ({ ...current, [key]: value }));
  }

  function updateRate(key: keyof WageRatesType, value: number) {
    setReport((current) => ({
      ...current,
      rates: { ...current.rates, [key]: value },
    }));
  }

  function updateRow(id: string, patch: Partial<ReworkRow>) {
    setReport((current) => ({
      ...current,
      rows: current.rows.map((row) =>
        row.id === id ? { ...row, ...patch } : row,
      ),
    }));
  }

  function updateRowCount(requestedCount: number): boolean {
    const rowCount = normalizeReportRowCount(requestedCount);
    if (rowCount === report.rows.length) return true;

    const removedRows = report.rows.slice(rowCount);
    if (
      removedRows.some(hasReworkRowData) &&
      !window.confirm(`减少为 ${rowCount} 天会删除后面已填写的数据，是否继续？`)
    ) {
      return false;
    }

    setReport((current) => ({
      ...current,
      rows: resizeReportRows(current.rows, rowCount),
    }));
    return true;
  }

  function handleReset() {
    if (!window.confirm('清空所有已填写内容？此操作无法撤销。')) return;
    setReport(resetReport());
  }

  return (
    <>
      <Toolbar
        onReset={handleReset}
        onPrint={() => window.print()}
        onLogout={() => window.location.assign('/api/logout')}
      />
      <main className="page" id="report">
        <ReportHeader
          projectName={report.projectName}
          reportTitle={report.reportTitle}
          subtitle={report.subtitle}
          period={period}
          onProjectNameChange={(value) => updateMeta('projectName', value)}
          onReportTitleChange={(value) => updateMeta('reportTitle', value)}
          onSubtitleChange={(value) => updateMeta('subtitle', value)}
        />
        <SummaryCards totals={totals} />
        <WageRates rates={report.rates} onChange={updateRate} />
        <ReworkTable
          rows={report.rows}
          rates={report.rates}
          totals={totals}
          onRowChange={updateRow}
          onRowCountChange={updateRowCount}
        />
        <CostBreakdown totals={totals} />
      </main>
    </>
  );
}
