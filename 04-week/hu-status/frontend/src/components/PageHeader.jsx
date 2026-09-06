export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-head">
      <div className="page-title-wrap">
        <h1>{title}</h1>
        {subtitle ? <span className="page-sub">{subtitle}</span> : null}
      </div>
      {action}
    </header>
  );
}
