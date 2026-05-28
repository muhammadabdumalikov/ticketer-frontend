// Modals — Add subject

function deriveSigil(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ADD_SUBJECT_COLORS = [
  '#FF4D1F', '#1F9D55', '#6F46D7', '#0F62FE',
  '#0A8F90', '#D43872', '#E11D48', '#F59E0B',
];

function Modal({ open, onClose, children, width = 520 }) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function AddSubjectModal({ open, onClose, onAdd }) {
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [color, setColor] = React.useState(ADD_SUBJECT_COLORS[0]);
  const [students, setStudents] = React.useState(40);
  const [sigilManual, setSigilManual] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setName(''); setCode(''); setColor(ADD_SUBJECT_COLORS[0]);
      setStudents(40); setSigilManual('');
    }
  }, [open]);

  const sigil = sigilManual || deriveSigil(name) || 'НП';
  const valid = name.trim().length >= 2 && code.trim().length >= 2;

  function submit(e) {
    e && e.preventDefault();
    if (!valid) return;
    const subject = {
      id: 'new_' + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      sigil,
      color,
      tickets: 0,
      exams: 0,
      students: students || 0,
      progress: 0,
      status: 'draft',
    };
    onAdd(subject);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="modal-form">
        <div className="modal-head">
          <div className="modal-eyebrow">Новый предмет</div>
          <h3>Добавьте предмет в ваш список</h3>
          <p>Предмет появится в списке. Билеты и экзамены вы сможете создать после.</p>
        </div>

        <div className="modal-body">
          <div className="modal-row" style={{ gridTemplateColumns: '76px 1fr' }}>
            <div className="modal-preview">
              <div className="modal-sigil" style={{ background: color }}>{sigil}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <div className="m-field">
                <label>Название предмета</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="напр. Теория графов"
                  autoFocus
                />
              </div>
              <div className="modal-row" style={{ gridTemplateColumns: '1fr 100px' }}>
                <div className="m-field">
                  <label>Код</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="напр. MATH-380"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="m-field">
                  <label>Сигил</label>
                  <input
                    value={sigil}
                    onChange={(e) => setSigilManual(e.target.value.slice(0, 3).toUpperCase())}
                    placeholder="ТГ"
                    maxLength={3}
                    style={{ textAlign: 'center', fontWeight: 600, letterSpacing: '0.04em' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="m-field">
            <label>Цвет</label>
            <div className="color-swatches">
              {ADD_SUBJECT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`swatch ${color === c ? 'on' : ''}`}
                  onClick={() => setColor(c)}
                  style={{ background: c }}
                  aria-label={c}
                >
                  {color === c && <DI.check />}
                </button>
              ))}
            </div>
          </div>

          <div className="m-field">
            <label>Число студентов (опционально)</label>
            <input
              type="number" min="0" max="500"
              value={students}
              onChange={(e) => setStudents(parseInt(e.target.value || '0', 10))}
            />
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={!valid}>
            <DI.plus /> Добавить предмет
          </button>
        </div>
      </form>
    </Modal>
  );
}

window.AddSubjectModal = AddSubjectModal;
