interface ReportHeaderProps {
  projectName: string;
  reportTitle: string;
  subtitle: string;
  period: string;
  onProjectNameChange: (value: string) => void;
  onReportTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

export function ReportHeader({
  projectName,
  reportTitle,
  subtitle,
  period,
  onProjectNameChange,
  onReportTitleChange,
  onSubtitleChange,
}: ReportHeaderProps) {
  return (
    <>
      <header className="report-head">
        <div className="head-left">
          <div className="project-pill">
            <input
              className="editable-text project-input"
              value={projectName}
              aria-label="项目名称"
              onChange={(event) => onProjectNameChange(event.target.value)}
            />
          </div>
          <h1>
            <input
              className="editable-text title-input"
              value={reportTitle}
              aria-label="报表标题"
              onChange={(event) => onReportTitleChange(event.target.value)}
            />
          </h1>
          <div className="subtitle">
            <input
              className="editable-text subtitle-input"
              value={subtitle}
              aria-label="副标题"
              onChange={(event) => onSubtitleChange(event.target.value)}
            />
          </div>
        </div>

        <div className="meta">
          <div className="meta-item">
            <div className="label">统计期间</div>
            <div className="value">{period}</div>
          </div>
          <div className="meta-item">
            <div className="label">币种</div>
            <div className="value">泰铢 ฿</div>
          </div>
          <div className="meta-item">
            <div className="label">口径</div>
            <div className="value">正常工资 + 加班工资 + 监工工资</div>
          </div>
        </div>
      </header>
      <div className="rule" />
    </>
  );
}
