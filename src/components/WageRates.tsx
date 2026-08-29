import { normalizeNonNegativeNumber } from '../lib/format';
import type { WageRates as WageRatesType } from '../types/report';

interface WageRatesProps {
  rates: WageRatesType;
  onChange: (key: keyof WageRatesType, value: number) => void;
}

const items: Array<{
  key: keyof WageRatesType;
  label: string;
  className: string;
}> = [
  { key: 'normal', label: '正常工资', className: 'normal' },
  { key: 'ot', label: '加班工资', className: 'ot' },
  { key: 'supervisor', label: '监工工资', className: 'sup' },
];

export function WageRates({ rates, onChange }: WageRatesProps) {
  return (
    <section className="rates" aria-label="工资标准">
      <div className="rates-title">工资标准</div>
      {items.map((item) => (
        <div className="rate-chip" key={item.key}>
          <span className={`dot ${item.className}`} />
          <span>{item.label}</span>
          <strong>
            ฿
            <input
              className="rate-input"
              type="number"
              min="0"
              step="1"
              value={rates[item.key] || ''}
              aria-label={item.label}
              onChange={(event) =>
                onChange(
                  item.key,
                  normalizeNonNegativeNumber(event.target.value),
                )
              }
            />
          </strong>
          <span className="rate-unit">/ 人·小时</span>
        </div>
      ))}
    </section>
  );
}
