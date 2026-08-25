import { useEffect, useState } from 'react';
import { calculateRow } from '../lib/calculations';
import { formatDateInput, normalizeDateInput, numberText, weekday } from '../lib/format';
import type { ReportTotals, ReworkRow, WageRates } from '../types/report';

interface ReworkTableProps {
  rows: ReworkRow[];
  rates: WageRates;
  totals: ReportTotals;
  onRowChange: (id: string, patch: Partial<ReworkRow>) => void;
}


interface DateFieldProps {
  value: string;
  onCommit: (value: string) => void;
}

function DateField({ value, onCommit }: DateFieldProps) {
  const [draft, setDraft] = useState(() => formatDateInput(value));

  useEffect(() => {
    setDraft(formatDateInput(value));
  }, [value]);

  function commit() {
    const normalized = normalizeDateInput(draft, value);
    setDraft(formatDateInput(normalized));
    onCommit(normalized);
  }

  return (
    <input
      className="data-input date-input"
      type="text"
      inputMode="numeric"
      maxLength={10}
      value={draft}
      aria-label="日期"
      placeholder="YYYY/MM/DD"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

interface NumberFieldProps {
  value: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
}

function NumberField({ value, step = 1, label, onChange }: NumberFieldProps) {
  return (
    <input
      className="data-input"
      type="number"
      min="0"
      step={step}
      value={value}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value || 0))}
    />
  );
}

export function ReworkTable({ rows, rates, totals, onRowChange }: ReworkTableProps) {
  return (
    <section>
      <div className="section-title-row">
        <div className="section-title">每日返工明细</div>
        <div className="section-note">金额单位：泰铢 ฿ · 工时单位：小时</div>
      </div>

      <div className="table-wrap">
        <table>
          <colgroup>
            <col style={{ width: '15%' }} /><col style={{ width: '8%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} />
            <col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '12%' }} /><col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr className="group">
              <th colSpan={5}>用工情况</th>
              <th colSpan={2}>员工工资</th>
              <th>当日合计</th>
              <th colSpan={3}>监工</th>
            </tr>
            <tr className="cols">
              <th>日期</th><th>返工人数</th><th>正常工时/人</th><th>加班工时/人</th><th>员工总工时</th>
              <th>正常工资</th><th>加班工资</th><th>当日总成本</th><th>监工人数</th><th>监工工时</th><th>监工工资</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const calc = calculateRow(row, rates);
              const barWidth = Math.max(8, Math.min(70, (calc.total / 6000) * 70));
              return (
                <tr key={row.id}>
                  <td className="date-cell">
                    <DateField value={row.date} onCommit={(date) => onRowChange(row.id, { date })} />
                    <span className="weekday">{weekday(row.date)}</span>
                  </td>
                  <td><NumberField label="返工人数" value={row.workers} onChange={(value) => onRowChange(row.id, { workers: value })} /></td>
                  <td><NumberField label="正常工时/人" value={row.normalHours} step={0.5} onChange={(value) => onRowChange(row.id, { normalHours: value })} /></td>
                  <td><NumberField label="加班工时/人" value={row.otHours} step={0.5} onChange={(value) => onRowChange(row.id, { otHours: value })} /></td>
                  <td>{numberText(calc.employeeHours)}</td>
                  <td className="money">{calc.normalCost ? numberText(calc.normalCost) : <span className="zero">0</span>}</td>
                  <td className="money">{calc.otCost ? numberText(calc.otCost) : <span className="zero">0</span>}</td>
                  <td className="daily-total">
                    <div className="total-cell">
                      <span>{numberText(calc.total)}</span>
                      <span className="mini-bar" style={{ width: `${barWidth}px` }} />
                    </div>
                  </td>
                  <td><NumberField label="监工人数" value={row.supervisorPeople} onChange={(value) => onRowChange(row.id, { supervisorPeople: value })} /></td>
                  <td><NumberField label="监工工时" value={row.supervisorHours} step={0.5} onChange={(value) => onRowChange(row.id, { supervisorHours: value })} /></td>
                  <td className="money">{calc.supervisorCost ? numberText(calc.supervisorCost) : <span className="zero">0</span>}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td>合计</td><td className="dash">—</td><td className="dash">—</td><td className="dash">—</td>
              <td>{numberText(totals.employeeHours)}</td><td>{numberText(totals.normalCost)}</td><td>{numberText(totals.otCost)}</td>
              <td className="grand">{numberText(totals.total)}</td><td className="dash">—</td><td>{numberText(totals.supervisorHours)}</td><td>{numberText(totals.supervisorCost)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
