import { useEffect, useMemo, useState } from 'react';
import { CostBreakdown } from './components/CostBreakdown';
import { ReportHeader } from './components/ReportHeader';
import { ReworkTable } from './components/ReworkTable';
import { SummaryCards } from './components/SummaryCards';
import { Toolbar } from './components/Toolbar';
import { WageRates } from './components/WageRates';
import { calculateTotals } from './lib/calculations';
import { periodText } from './lib/format';
import { loadReport, resetReport, saveReport } from './lib/storage';
import type { ReportState, ReworkRow, WageRates as WageRatesType } from './types/report';

export default function App() {
  const [report, setReport] = useState<ReportState>(() => loadReport());
  const totals = useMemo(() => calculateTotals(report), [report]);
  const period = useMemo(() => periodText(report.rows.map((row) => row.date)), [report.rows]);

  useEffect(() => {
    saveReport(report);
  }, [report]);

  function updateMeta(key: 'projectName' | 'reportTitle' | 'subtitle', value: string) {
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
      rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function handleReset() {
    if (!window.confirm('恢复为初始返工数据？当前编辑内容会被覆盖。')) return;
    setReport(resetReport());
  }

  return (
    <>
      <Toolbar onReset={handleReset} onPrint={() => window.print()} />
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
        <ReworkTable rows={report.rows} rates={report.rates} totals={totals} onRowChange={updateRow} />
        <CostBreakdown totals={totals} />
      </main>
    </>
  );
}
