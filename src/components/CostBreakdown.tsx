import { money, percent } from '../lib/format';
import type { ReportTotals } from '../types/report';

interface CostBreakdownProps {
  totals: ReportTotals;
}

export function CostBreakdown({ totals }: CostBreakdownProps) {
  const normalPct = percent(totals.normalCost, totals.total);
  const otPct = percent(totals.otCost, totals.total);
  const supervisorPct = percent(totals.supervisorCost, totals.total);

  return (
    <section className="breakdown">
      <div className="breakdown-head">
        <div className="breakdown-title">
          总成本构成 · {money(totals.total)}
        </div>
        <div className="breakdown-note">按工资类型占比</div>
      </div>
      <div className="stack">
        <div className="seg normal" style={{ width: `${normalPct}%` }} />
        <div className="seg ot" style={{ width: `${otPct}%` }} />
        <div className="seg sup" style={{ width: `${supervisorPct}%` }} />
      </div>
      <div className="legend">
        <div className="legend-item">
          <span className="dot normal" />
          <span>正常工资</span>
          <strong>{money(totals.normalCost)}</strong>
          <span>· {normalPct.toFixed(1)}%</span>
        </div>
        <div className="legend-item">
          <span className="dot ot" />
          <span>加班工资</span>
          <strong>{money(totals.otCost)}</strong>
          <span>· {otPct.toFixed(1)}%</span>
        </div>
        <div className="legend-item">
          <span className="dot sup" />
          <span>监工工资</span>
          <strong>{money(totals.supervisorCost)}</strong>
          <span>· {supervisorPct.toFixed(1)}%</span>
        </div>
      </div>
    </section>
  );
}
