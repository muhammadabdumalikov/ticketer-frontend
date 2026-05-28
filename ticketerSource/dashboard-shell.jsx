// Sidebar + Topbar shell

function Sidebar({ active, onNavigate, counts }) {
  const items = [
    { id: 'home',      label: 'Главная',         icon: 'home' },
    { id: 'subjects',  label: 'Предметы',        icon: 'book',    count: counts.subjects },
    { id: 'tickets',   label: 'Билеты',          icon: 'ticket',  count: counts.tickets },
    { id: 'sessions',  label: 'Сессии',          icon: 'calendar', disabled: true },
    { id: 'bank',      label: 'Банк вопросов', icon: 'bank',     disabled: true },
    { id: 'analytics', label: 'Аналитика',       icon: 'chart',    disabled: true },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="logo" aria-hidden="true"></span>
        <span className="mark">ticketer<span>.</span></span>
      </div>

      <div>
        <div className="sb-section">Рабочее пространство</div>
        {items.map((it) => {
          const Ic = DI[it.icon];
          return (
            <div
              key={it.id}
              className={`sb-item ${active === it.id ? 'active' : ''} ${it.disabled ? 'disabled' : ''}`}
              onClick={() => !it.disabled && onNavigate(it.id)}
              aria-disabled={it.disabled || undefined}
            >
              <span className="ic"><Ic /></span>
              <span>{it.label}</span>
              {it.disabled && <span className="soon">скоро</span>}
              {it.count != null && <span className="count">{it.count}</span>}
            </div>
          );
        })}
      </div>

      <div>
        <div className="sb-section">Аккаунт</div>
        <div className={`sb-item ${active === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>
          <span className="ic"><DI.settings /></span>
          <span>Настройки</span>
        </div>
        <div className="sb-item">
          <span className="ic"><DI.help /></span>
          <span>Помощь и документация</span>
        </div>
      </div>

      <div className="sb-user">
        <div className="avatar">ЕН</div>
        <div className="who">
          <div className="name">Д-р Елена Новик</div>
          <div className="role">Доцент</div>
        </div>
        <span className="more"><DI.more /></span>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, onPrimary, primaryLabel = 'Новый экзамен' }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep"><DI.chev /></span>}
            {c.onClick ? <a onClick={c.onClick}>{c.label}</a> :
              <span className={i === crumbs.length - 1 ? 'now' : ''}>{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="spacer"></div>
      <label className="search">
        <DI.search />
        <input placeholder="Поиск предметов, билетов, студентов…" />
        <kbd>⌘ K</kbd>
      </label>
      <div className="ibtn-circle"><DI.bell /><span className="badge"></span></div>
      {onPrimary && (
        <button className="btn btn-primary" onClick={onPrimary}>
          <DI.plus /> {primaryLabel}
        </button>
      )}
    </div>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
