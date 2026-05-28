// Waiting room view

const STUDENTS = [
  { id: 1, name: 'Анна Петрова',     sig: 'АП', online: true,  me: false },
  { id: 2, name: 'Игорь Волков',     sig: 'ИВ', online: true,  me: false },
  { id: 3, name: 'Михаил Соколов',   sig: 'МС', online: true,  me: true  },
  { id: 4, name: 'Дарья Левина',     sig: 'ДЛ', online: true,  me: false },
  { id: 5, name: 'Артём Кузьмин',    sig: 'АК', online: true,  me: false },
  { id: 6, name: 'Виктория Орлова',  sig: 'ВО', online: true,  me: false },
  { id: 7, name: 'Кирилл Сидоров',   sig: 'КС', online: true,  me: false },
  { id: 8, name: 'Полина Зайцева',   sig: 'ПЗ', online: true,  me: false },
  { id: 9, name: 'Юлия Морозова',    sig: 'ЮМ', online: true,  me: false },
  { id: 10, name: 'Тимофей Белов',   sig: 'ТБ', online: true,  me: false },
  { id: 11, name: 'Алина Ковалёва',  sig: 'АК', online: true,  me: false },
  { id: 12, name: 'Дмитрий Гусев',   sig: 'ДГ', online: true,  me: false },
  { id: 13, name: 'Софья Орехова',   sig: 'СО', online: true,  me: false },
  { id: 14, name: 'Никита Лебедев',  sig: 'НЛ', online: true,  me: false },
  { id: 15, name: 'Мария Дьякова',   sig: 'МД', online: true,  me: false },
  { id: 16, name: 'Антон Семёнов',   sig: 'АС', online: true,  me: false },
  { id: 17, name: 'Карина Жукова',   sig: 'КЖ', online: false, me: false },
  { id: 18, name: 'Денис Корнев',    sig: 'ДК', online: false, me: false },
  { id: 19, name: 'Эвелина Климова', sig: 'ЭК', online: false, me: false },
  { id: 20, name: 'Олег Ильин',      sig: 'ОИ', online: false, me: false },
];

function Waiting({ onStart, examInfo, started, student }) {
  // Replace the "me" entry with the actual joined student if provided
  const list = React.useMemo(() => {
    if (!student) return STUDENTS;
    const parts = student.name.trim().split(/\s+/);
    const sig = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
    return STUDENTS.map((s) =>
      s.me ? { ...s, name: student.name, sig } : s
    );
  }, [student]);

  // simulate students slowly trickling in
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (started) return;
    const t = setInterval(() => setTick((x) => x + 1), 6000);
    return () => clearInterval(t);
  }, [started]);

  const online = STUDENTS.filter((s) => s.online).length + Math.min(tick, 4);
  const total = STUDENTS.length;

  return (
    <>
      <div className="top">
        <div className="title">
          {examInfo.subject}
          <span className="info" title="Информация">i</span>
        </div>
        <div className="spacer"></div>
        <div className="pill-time">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)', display: 'inline-block' }}></span>
          Ожидание
        </div>
        <div className="tools">
          <div className="tool danger" title="Покинуть"><DI.back /></div>
        </div>
      </div>

      <div className="wait-body">
        <div className="wait-left">
          <div className="wait-eyebrow">
            <span className="pulse"></span>
            ЭКЗАМЕН ВОТ-ВОТ НАЧНЁТСЯ
          </div>

          <h1 className="wait-headline">
            Ожидайте начала экзамена. <em>Преподаватель скоро запустит сессию.</em>
          </h1>

          <p className="wait-sub">
            Когда все студенты будут в комнате, преподаватель нажмёт «Начать», и каждому
            автоматически выпадет случайный билет. Не закрывайте эту вкладку.
          </p>

          <div className="wait-meta">
            <div className="it">
              <div className="k">Предмет</div>
              <div className="v">{examInfo.subject}</div>
            </div>
            <div className="it">
              <div className="k">Код</div>
              <div className="v">{examInfo.code}</div>
            </div>
            <div className="it">
              <div className="k">Дата</div>
              <div className="v">{examInfo.date}</div>
            </div>
            <div className="it">
              <div className="k">Длительность</div>
              <div className="v">{examInfo.duration}<small> мин</small></div>
            </div>
            <div className="it">
              <div className="k">Билетов</div>
              <div className="v">{examInfo.tickets}<small> в сессии</small></div>
            </div>
            <div className="it">
              <div className="k">Преподаватель</div>
              <div className="v">{examInfo.teacher}</div>
            </div>
          </div>

          <div className="wait-hint">
            <DI.shield />
            <div>
              <b>Не покидайте страницу.</b> Если вы случайно закроете вкладку,
              откройте ту же ссылку — вы вернётесь в комнату. Сессия защищена и контролируется
              преподавателем.
            </div>
          </div>
        </div>

        <div className="wait-right">
          <div className="wait-right-head">
            <h3>В комнате</h3>
            <span className="count"><b>{online}</b> из {total}</span>
          </div>

          <div className="students">
            {list.map((s, i) => {
              const isOnline = s.online || i < (STUDENTS.filter((x) => x.online).length + Math.min(tick, 4));
              return (
                <div key={s.id} className={`stu ${s.me ? 'me' : ''} ${!isOnline ? 'away' : ''}`}>
                  <div className={`av ${s.me ? 'me' : ''}`}>{s.sig}</div>
                  <span className="name">{s.name}</span>
                  {s.me
                    ? <span className="me-tag">ВЫ</span>
                    : <span className="led"></span>
                  }
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--muted)', fontSize: 13, paddingTop: 4 }}>
            <DI.bell />
            <span>Когда экзамен начнётся, вы услышите сигнал и страница обновится автоматически.</span>
          </div>
        </div>
      </div>

      <div className="foot">
        <div className="help" title="Помощь"><span style={{ fontSize: 16, color: 'var(--muted)' }}>?</span></div>
        <span></span>
        <div className="nav">
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, color: 'var(--muted)', padding: '10px 16px' }}>
            session-id: math-301-spr24-final
          </div>
        </div>
      </div>
    </>
  );
}

window.Waiting = Waiting;
