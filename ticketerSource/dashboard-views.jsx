// Home + Subject views

// ── Sample data ─────────────────────────────────────────────────
const SUBJECTS = [
  { id: 's1', name: 'Теория вероятностей и статистика', code: 'MATH-301', sigil: 'ТВ', color: '#FF4D1F', tickets: 124, exams: 6, students: 84, progress: 0.72, status: 'live' },
  { id: 's2', name: 'Дискретная математика',           code: 'CS-204',   sigil: 'ДМ', color: '#1F9D55', tickets: 96,  exams: 4, students: 62, progress: 0.55, status: 'active' },
  { id: 's3', name: 'Линейная алгебра',                 code: 'MATH-220', sigil: 'ЛА', color: '#6F46D7', tickets: 142, exams: 7, students: 96, progress: 0.84, status: 'active' },
  { id: 's4', name: 'Алгоритмы и структуры данных',   code: 'CS-310',   sigil: 'АС', color: '#0F62FE', tickets: 88,  exams: 5, students: 71, progress: 0.41, status: 'draft' },
  { id: 's5', name: 'Численные методы',              code: 'MATH-340', sigil: 'ЧМ', color: '#0A8F90', tickets: 54,  exams: 3, students: 38, progress: 0.30, status: 'active' },
  { id: 's6', name: 'Математическая логика',             code: 'MATH-251', sigil: 'МЛ', color: '#D43872', tickets: 62,  exams: 4, students: 44, progress: 0.66, status: 'active' },
];

const SCHEDULE = [
  { d: '24', m: 'мая', title: 'Теория вероятностей — Весенний экзамен', sub: 'MATH-301 · 84 студентов', dur: '90 мин', q: '27 вопр.', status: { label: 'LIVE 14:00', kind: 'orange' } },
  { d: '26', m: 'мая', title: 'Дискретная математика — Пересдача',   sub: 'CS-204 · 12 студентов',  dur: '60 мин', q: '18 вопр.', status: { label: 'ЗАПЛАНИРОВАН',  kind: '' } },
  { d: '28', m: 'мая', title: 'Линейная алгебра — Пробный билет Б', sub: 'MATH-220 · 96 студентов', dur: '45 мин', q: '15 вопр.', status: { label: 'ЧЕРНОВИК',      kind: '' } },
  { d: '02', m: 'июн', title: 'Алгоритмы — Итоговый экзамен',     sub: 'CS-310 · 71 студент',  dur: '120 мин', q: '36 вопр.', status: { label: 'ГОТОВ',       kind: 'green' } },
];

const EXAMS = {
  s1: [
    { id: 'e1', title: 'Весенний итоговый экзамен',     status: 'Запланирован', q: 27, time: '90 мин', updated: '2 дня назад', author: 'Вы' },
    { id: 'e2', title: 'Промежуточный — Байесов анализ', status: 'Опубликован', q: 18, time: '45 мин', updated: '5 дней назад', author: 'Вы' },
    { id: 'e3', title: 'Пробный — Случайные величины',   status: 'Черновик',     q: 12, time: '30 мин', updated: 'Только что', author: 'Вы' },
    { id: 'e4', title: 'Пересдача — Цепи Маркова',        status: 'Архив',  q: 22, time: '60 мин', updated: '3 недели назад', author: 'А. Ким' },
  ],
  default: [
    { id: 'd1', title: 'Промежуточный экзамен',          status: 'Запланирован', q: 20, time: '60 мин', updated: '1 день назад',  author: 'Вы' },
    { id: 'd2', title: 'Пробный билет А',             status: 'Опубликован', q: 15, time: '40 мин', updated: '6 дней назад', author: 'Вы' },
    { id: 'd3', title: 'Итоговый экзамен · черновик',     status: 'Черновик',     q: 24, time: '90 мин', updated: 'Только что',   author: 'Вы' },
  ],
};

// ── Subject card ────────────────────────────────────────────────
function SubjectCard({ subj, onOpen }) {
  return (
    <div className="subj" onClick={() => onOpen(subj)}>
      <div className="top">
        <div className="sigil" style={{ background: subj.color + '14', color: subj.color }}>{subj.sigil}</div>
        <div className={`pill-status ${subj.status === 'live' ? 'live' : ''}`}>
          {subj.status === 'live' ? '● В ЭФИРЕ' : subj.status === 'draft' ? 'ЧЕРНОВИК' : 'АКТИВЕН'}
        </div>
      </div>
      <div>
        <div className="name">{subj.name}</div>
        <div className="code">{subj.code}</div>
      </div>
      <div className="row">
        <div className="stat-mini"><div className="k">Билетов</div><div className="v">{subj.tickets}</div></div>
        <div className="stat-mini"><div className="k">Экзаменов</div><div className="v">{subj.exams}</div></div>
        <div className="stat-mini"><div className="k">Студентов</div><div className="v">{subj.students}</div></div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
          <span>Прогресс семестра</span>
          <span>{Math.round(subj.progress * 100)}%</span>
        </div>
        <div className="bar"><i style={{ width: (subj.progress * 100) + '%', background: subj.color }}></i></div>
      </div>
    </div>
  );
}

// ── Home view ───────────────────────────────────────────────────
function HomeView({ onOpenSubject, onCreate, onAddSubject }) {
  return (
    <>
      <div className="hello">
        <div>
          <h1>Добрый день, Елена. <em>На этой неделе у вас 3 экзамена.</em></h1>
          <div className="sub">Весенний семестр · Неделя 12 из 16 · 2 сессии запустятся в ближайшие 48 часов.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onCreate}>
          <DI.plus /> Создать экзамен
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="k">Активных предметов</div>
          <div className="v">6</div>
          <div className="delta"><DI.up /> +2 в этом семестре</div>
        </div>
        <div className="stat">
          <div className="k">Билетов в банке</div>
          <div className="v">566</div>
          <div className="delta"><DI.up /> +42 за неделю</div>
        </div>
        <div className="stat">
          <div className="k">Сессий за неделю</div>
          <div className="v">12</div>
          <div className="delta"><DI.up /> +4 к прошлой неделе</div>
        </div>
        <div className="stat">
          <div className="k">Средний балл</div>
          <div className="v">71<small>/100</small></div>
          <div className="delta down"><DI.down /> −2,4 к прошлому семестру</div>
        </div>
      </div>

      <div className="sect-head">
        <div>
          <h2>Ваши предметы</h2>
          <div className="meta">Выберите предмет, чтобы посмотреть экзамены или создать новый билет.</div>
        </div>
        <div className="actions">
          <button className="btn btn-outline btn-sm"><DI.filter /> Фильтр</button>
          <button className="btn btn-outline btn-sm" onClick={onAddSubject}><DI.plus /> Предмет</button>
        </div>
      </div>
      <div className="subjects">
        {SUBJECTS.map((s) => <SubjectCard key={s.id} subj={s} onOpen={onOpenSubject} />)}
      </div>

      <div className="sect-head">
        <div>
          <h2>Предстоящие сессии</h2>
          <div className="meta">Запланированные и активные окна экзаменов по всем предметам.</div>
        </div>
        <div className="actions">
          <button className="btn btn-outline btn-sm">Показать все</button>
        </div>
      </div>
      <div className="surface" style={{ padding: '14px 18px' }}>
        <div className="schedule">
          <div className="sch-row head">
            <span>Дата</span>
            <span>Экзамен</span>
            <span>Длительность</span>
            <span>Вопросы</span>
            <span>Статус</span>
            <span></span>
          </div>
          {SCHEDULE.map((r, i) => (
            <div className="sch-row" key={i}>
              <div className="sch-date">
                <div className="d">{r.d}</div>
                <div className="m">{r.m}</div>
              </div>
              <div>
                <div className="sch-title">{r.title}</div>
                <div className="sch-sub">{r.sub}</div>
              </div>
              <div className="sch-cell">{r.dur}</div>
              <div className="sch-cell">{r.q}</div>
              <div><span className={`pill ${r.status.kind}`}>{r.status.label}</span></div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-ghost btn-sm">Открыть <DI.arrow /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Subject view ────────────────────────────────────────────────
function SubjectView({ subject, onBack, onCreateExam, onOpenExam }) {
  const [tab, setTab] = React.useState('exams');
  const list = EXAMS[subject.id] || EXAMS.default;

  return (
    <>
      <div className="sub-head">
        <div className="sigil-lg" style={{ background: subject.color }}>{subject.sigil}</div>
        <div>
          <h1>{subject.name}</h1>
          <div className="meta">
            <span><b>{subject.code}</b></span>
            <span>·</span>
            <span><b>{subject.students}</b> записано</span>
            <span>·</span>
            <span><b>{subject.tickets}</b> билетов в банке</span>
            <span>·</span>
            <span><b>{subject.exams}</b> экзаменов</span>
          </div>
        </div>
        <div className="right">
          <button className="btn btn-outline"><DI.eye /> Предпросмотр</button>
          <button className="btn btn-primary" onClick={() => onCreateExam(subject)}>
            <DI.plus /> Новый экзамен
          </button>
        </div>
      </div>

      <div className="tabs2">
        {['exams', 'bank', 'sessions', 'students'].map((t) => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t === 'exams' ? 'Экзамены' : t === 'bank' ? 'Банк вопросов' : t === 'sessions' ? 'Сессии' : 'Студенты'}
          </button>
        ))}
      </div>

      {tab === 'exams' && (
        <div className="exam-list">
          {list.map((e, i) => (
            <div className="exam-row" key={e.id} onClick={() => onOpenExam(e)}>
              <div className="num">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div className="title">{e.title}</div>
                <div className="sub">Обновлено {e.updated} · автор: {e.author}</div>
              </div>
              <div className="cell">
                <div className="k">Вопросы</div>
                <div>{e.q} вопр.</div>
              </div>
              <div className="cell">
                <div className="k">Длительность</div>
                <div>{e.time}</div>
              </div>
              <div>
                <span className={`pill ${e.status === 'Опубликован' ? 'green' : e.status === 'Запланирован' ? 'orange' : ''}`}>
                  {e.status.toUpperCase()}
                </span>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost btn-sm" onClick={(ev) => { ev.stopPropagation(); onOpenExam(e); }}>Открыть</button>
                <button className="btn btn-ghost btn-sm" onClick={(ev) => ev.stopPropagation()}><DI.more /></button>
              </div>
            </div>
          ))}

          <div
            className="exam-row"
            style={{ border: '1.5px dashed var(--line)', background: 'transparent', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => onCreateExam(subject)}
          >
            <div></div>
            <div style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <DI.plus /> Новый билет для {subject.code}
            </div>
            <div></div><div></div><div></div><div></div>
          </div>
        </div>
      )}

      {tab !== 'exams' && (
        <div className="empty">
          <h3>{tab === 'bank' ? 'Банк вопросов' : tab === 'sessions' ? 'Сессии' : 'Студенты'}</h3>
          <p>Этот раздел — часть полного прототипа. Пока сосредоточимся на создании экзамена.</p>
          <button className="btn btn-primary" onClick={() => setTab('exams')}>Назад к экзаменам</button>
        </div>
      )}
    </>
  );
}

// ── Subjects list view (full directory) ─────────────────────────
function SubjectsListView({ onOpenSubject, onCreateExam, onAddSubject }) {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState('name');
  const [filter, setFilter] = React.useState('all'); // all | active | live | draft

  let list = SUBJECTS.filter((s) => {
    if (filter === 'live'   && s.status !== 'live')   return false;
    if (filter === 'active' && s.status !== 'active' && s.status !== 'live') return false;
    if (filter === 'draft'  && s.status !== 'draft')  return false;
    if (query) {
      const q = query.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  list = list.slice().sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'ru');
    if (sort === 'tickets') return b.tickets - a.tickets;
    if (sort === 'students') return b.students - a.students;
    if (sort === 'progress') return b.progress - a.progress;
    return 0;
  });

  const filters = [
    { id: 'all',    label: 'Все' },
    { id: 'live',   label: 'В эфире' },
    { id: 'active', label: 'Активные' },
    { id: 'draft',  label: 'Черновики' },
  ];

  return (
    <>
      <div className="hello">
        <div>
          <h1>Предметы. <em>Всего {SUBJECTS.length}.</em></h1>
          <div className="sub">Все предметы, которые вы ведёте в этом семестре. Откройте предмет, чтобы посмотреть его экзамены и банк вопросов.</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onAddSubject}>
          <DI.plus /> Добавить предмет
        </button>
      </div>

      <div className="surface" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="tabs2">
          {filters.map((f) => (
            <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--field)', borderRadius: 12, padding: '0 14px', height: 40 }}>
          <DI.search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или коду…"
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 14, color: 'var(--ink)' }}
          />
        </div>
        <div className="meta-field" style={{ minWidth: 180, padding: '6px 12px' }}>
          <label>Сортировка</label>
          <div className="val">
            <DI.list />
            <Dropdown
              value={sort}
              onChange={setSort}
              variant="inline"
              options={[
                { value: 'name',     label: 'По названию' },
                { value: 'tickets',  label: 'По числу билетов' },
                { value: 'students', label: 'По числу студентов' },
                { value: 'progress', label: 'По прогрессу' },
              ]}
            />
          </div>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="subjects">
          {list.map((s) => <SubjectCard key={s.id} subj={s} onOpen={onOpenSubject} />)}
        </div>
      ) : (
        <div className="empty">
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить фильтр или поисковый запрос.</p>
          <button className="btn btn-primary" onClick={() => { setQuery(''); setFilter('all'); }}>Сбросить фильтры</button>
        </div>
      )}
    </>
  );
}

window.HomeView = HomeView;
window.SubjectView = SubjectView;
window.SubjectsListView = SubjectsListView;
window.SUBJECTS = SUBJECTS;
window.EXAMS = EXAMS;
