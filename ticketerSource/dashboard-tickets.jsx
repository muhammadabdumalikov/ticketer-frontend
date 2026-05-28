// Tickets directory — flat list across all subjects

function flattenTickets() {
  const all = [];
  SUBJECTS.forEach((subj) => {
    const list = EXAMS[subj.id] || EXAMS.default;
    list.forEach((e) => {
      all.push({
        ...e,
        subjectId: subj.id,
        subjectName: subj.name,
        subjectCode: subj.code,
        subjectColor: subj.color,
        subjectSigil: subj.sigil,
      });
    });
  });
  return all;
}

function TicketsView({ onOpenSubject, onCreateExam }) {
  const allTickets = React.useMemo(() => flattenTickets(), []);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [subjectFilters, setSubjectFilters] = React.useState([]); // array of subject ids
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('updated');

  function toggleSubject(id) {
    setSubjectFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  let list = allTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (subjectFilters.length > 0 && !subjectFilters.includes(t.subjectId)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !t.title.toLowerCase().includes(q) &&
        !t.subjectName.toLowerCase().includes(q) &&
        !t.subjectCode.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
  list = list.slice().sort((a, b) => {
    if (sort === 'updated') return 0; // already in order
    if (sort === 'questions') return b.q - a.q;
    if (sort === 'title') return a.title.localeCompare(b.title, 'ru');
    if (sort === 'subject') return a.subjectName.localeCompare(b.subjectName, 'ru');
    return 0;
  });

  // counts
  const counts = {
    all: allTickets.length,
    'Опубликован': allTickets.filter((t) => t.status === 'Опубликован').length,
    'Запланирован': allTickets.filter((t) => t.status === 'Запланирован').length,
    'Черновик':     allTickets.filter((t) => t.status === 'Черновик').length,
    'Архив':        allTickets.filter((t) => t.status === 'Архив').length,
  };

  const statusFilters = [
    { id: 'all',          label: 'Все',           count: counts.all },
    { id: 'Опубликован',  label: 'Опубликованные', count: counts['Опубликован'] },
    { id: 'Запланирован', label: 'Запланированные', count: counts['Запланирован'] },
    { id: 'Черновик',     label: 'Черновики',     count: counts['Черновик'] },
    { id: 'Архив',        label: 'Архив',         count: counts['Архив'] },
  ];

  function pillKind(status) {
    if (status === 'Опубликован') return 'green';
    if (status === 'Запланирован') return 'orange';
    return '';
  }

  return (
    <>
      <div className="hello">
        <div>
          <h1>Билеты. <em>Всего {allTickets.length} в банке.</em></h1>
          <div className="sub">Все экзаменационные билеты по вашим предметам. Используйте фильтры, чтобы найти нужный.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => onCreateExam(null)}>
          <DI.plus /> Создать билет
        </button>
      </div>

      {/* Status filter chip strip */}
      <div className="t-filters">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            className={`t-chip ${statusFilter === f.id ? 'active' : ''}`}
            onClick={() => setStatusFilter(f.id)}
          >
            <span>{f.label}</span>
            <span className="t-chip-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar: search + sort + subject chips */}
      <div className="surface" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--field)', borderRadius: 12, padding: '0 14px', height: 40 }}>
            <DI.search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию билета, предмету или коду…"
              style={{ flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 14, color: 'var(--ink)' }}
            />
          </div>
          <div className="meta-field" style={{ minWidth: 200, padding: '6px 12px' }}>
            <label>Сортировка</label>
            <div className="val">
              <DI.list />
              <Dropdown
                value={sort}
                onChange={setSort}
                variant="inline"
                options={[
                  { value: 'updated',   label: 'По дате изменения' },
                  { value: 'title',     label: 'По названию' },
                  { value: 'subject',   label: 'По предмету' },
                  { value: 'questions', label: 'По числу вопросов' },
                ]}
              />
            </div>
          </div>
          {(subjectFilters.length > 0 || query || statusFilter !== 'all') && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSubjectFilters([]); setQuery(''); setStatusFilter('all'); }}
            >
              Сбросить
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="label-mono" style={{ marginRight: 4 }}>Предметы:</div>
          {SUBJECTS.map((s) => {
            const on = subjectFilters.includes(s.id);
            return (
              <button
                key={s.id}
                className={`subj-chip ${on ? 'on' : ''}`}
                onClick={() => toggleSubject(s.id)}
                style={on ? { background: s.color + '18', color: s.color, borderColor: s.color + '60' } : {}}
              >
                <span className="dot" style={{ background: s.color }}></span>
                {s.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tickets table */}
      {list.length > 0 ? (
        <div className="surface" style={{ padding: '14px 18px' }}>
          <div className="t-table">
            <div className="t-row head">
              <span>№</span>
              <span>Название билета</span>
              <span>Предмет</span>
              <span>Вопросов</span>
              <span>Длительность</span>
              <span>Изменено</span>
              <span>Статус</span>
              <span></span>
            </div>
            {list.map((t, i) => {
              const subj = SUBJECTS.find((s) => s.id === t.subjectId);
              return (
                <div className="t-row" key={t.subjectId + '_' + t.id} onClick={() => onOpenSubject(subj)}>
                  <div className="num">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="title">{t.title}</div>
                    <div className="sub-line">Автор: {t.author}</div>
                  </div>
                  <div className="t-subj">
                    <span className="t-sigil" style={{ background: t.subjectColor + '18', color: t.subjectColor }}>
                      {t.subjectSigil}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="t-subj-name">{t.subjectName}</div>
                      <div className="t-subj-code">{t.subjectCode}</div>
                    </div>
                  </div>
                  <div className="t-cell">{t.q} вопр.</div>
                  <div className="t-cell">{t.time}</div>
                  <div className="t-cell muted">{t.updated}</div>
                  <div>
                    <span className={`pill ${pillKind(t.status)}`}>{t.status.toUpperCase()}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpenSubject(subj); }}>Открыть</button>
                    <button className="btn btn-ghost btn-sm" onClick={(ev) => ev.stopPropagation()}><DI.more /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty">
          <h3>Билеты не найдены</h3>
          <p>Попробуйте изменить фильтры или поисковый запрос.</p>
          <button className="btn btn-primary" onClick={() => { setSubjectFilters([]); setQuery(''); setStatusFilter('all'); }}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </>
  );
}

window.TicketsView = TicketsView;
