// Custom dropdown — replaces native <select>
// Usage:
//   <Dropdown value={x} onChange={setX} options={[{ value: 'a', label: 'Alpha' }, ...]} />
// Optionally pass `icon` to show a leading icon, or `align="right"` to anchor the menu right.

function Dropdown({ value, onChange, options, placeholder = 'Выбрать…', icon, align = 'left', variant = 'inline', size = 'md', disabled = false }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Resolve current option for display
  const current = options.find((o) => (typeof o === 'object' ? o.value : o) === value);
  const currentLabel = current ? (typeof current === 'object' ? current.label : String(current)) : placeholder;

  // Close on outside click + escape
  React.useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(o) {
    const v = typeof o === 'object' ? o.value : o;
    onChange(v);
    setOpen(false);
  }

  const trigClass = `dd-trigger ${variant} ${size} ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`;

  return (
    <div className={`dd ${align === 'right' ? 'dd-right' : ''}`} ref={ref}>
      <button
        type="button"
        className={trigClass}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        {icon && <span className="dd-icon">{icon}</span>}
        <span className={`dd-value ${current ? '' : 'placeholder'}`}>{currentLabel}</span>
        <span className="dd-chev">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className="dd-menu" role="listbox">
          {options.map((o, i) => {
            const v = typeof o === 'object' ? o.value : o;
            const label = typeof o === 'object' ? o.label : String(o);
            const hint  = typeof o === 'object' ? o.hint : null;
            const isSel = v === value;
            return (
              <button
                type="button"
                key={i}
                className={`dd-item ${isSel ? 'sel' : ''}`}
                onClick={() => pick(o)}
                role="option"
                aria-selected={isSel}
              >
                <span className="dd-item-main">
                  <span className="dd-item-label">{label}</span>
                  {hint && <span className="dd-item-hint">{hint}</span>}
                </span>
                {isSel && (
                  <span className="dd-item-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 12 10 18 20 6"/>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.Dropdown = Dropdown;
