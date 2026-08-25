interface ToolbarProps {
  onReset: () => void;
  onPrint: () => void;
  onLogout: () => void;
}

export function Toolbar({ onReset, onPrint, onLogout }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        <button className="btn" type="button" onClick={onReset}>恢复默认数据</button>
        <button className="btn" type="button" onClick={onLogout}>退出登录</button>
        <button className="btn primary" type="button" onClick={onPrint}>导出 PDF / 打印</button>
      </div>
    </div>
  );
}
