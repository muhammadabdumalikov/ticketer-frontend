// Teacher proctoring app — timer + grading for verbal answer

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "state": "idle",
  "accent": "#FF4D1F"
}/*EDITMODE-END*/;

const ROSTER = [
  { id: 1,  name: 'Анна Петрова',      sig: 'АП', ticket: 12, status: 'done' },
  { id: 2,  name: 'Игорь Волков',      sig: 'ИВ', ticket: 4,  status: 'done' },
  { id: 3,  name: 'Михаил Соколов',    sig: 'МС', ticket: 7,  status: 'live', active: true },
  { id: 4,  name: 'Дарья Левина',      sig: 'ДЛ', ticket: 19, status: 'next' },
  { id: 5,  name: 'Артём Кузьмин',     sig: 'АК', ticket: 23, status: 'wait' },
  { id: 6,  name: 'Виктория Орлова',   sig: 'ВО', ticket: 2,  status: 'wait' },
  { id: 7,  name: 'Кирилл Сидоров',    sig: 'КС', ticket: 16, status: 'wait' },
  { id: 8,  name: 'Полина Зайцева',    sig: 'ПЗ', ticket: 8,  status: 'wait' },
  { id: 9,  name: 'Юлия Морозова',     sig: 'ЮМ', ticket: 11, status: 'wait' },
  { id: 10, name: 'Тимофей Белов',     sig: 'ТБ', ticket: 25, status: 'wait' },
  { id: 11, name: 'Алина Ковалёва',    sig: 'АК', ticket: 14, status: 'wait' },
  { id: 12, name: 'Дмитрий Гусев',     sig: 'ДГ', ticket: 6,  status: 'wait' },
];

const TICKET = {
  number: 7,
  question: 'Расскажите о свойствах нормального распределения. Чем оно характеризуется? Как оно связано с центральной предельной теоремой и где применяется на практике? Приведите 1–2 примера.',
  rubric: [
    'Указаны параметры μ и σ, симметричность, форма «колокола»',
    'Назван эмпирический закон 68–95–99,7%',
    'Связь с ЦПТ: сумма независимых одинаково распределённых СВ',
    'Приведён практический пример (контроль качества, ошибки, IQ…)',
  ],
  maxPoints: 10,
  limitSec: 5 * 60,
};

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, setState] = React.useState(tweaks.state); // 'idle' | 'recording' | 'finished'
  const [elapsed, setElapsed] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [notes, setNotes] = React.useState('');
  const [activeIdx, setActiveIdx] = React.useState(2); // Михаил Соколов
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-soft', tweaks.accent + '20');
  }, [tweaks.accent]);

  // Keep tweak state in sync with local state (so the Tweaks toggle works)
  React.useEffect(() => { setState(tweaks.state); }, [tweaks.state]);

  React.useEffect(() => {
    if (state !== 'recording') return;
    const t = setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  function startTimer() {
    setElapsed(0);
    setState('recording');
    setTweak('state', 'recording');
  }
  function stopTimer() {
    setState('finished');
    setTweak('state', 'finished');
  }
  function reset() {
    setElapsed(0);
    setScore(0);
    setNotes('');
    setState('idle');
    setTweak('state', 'idle');
  }

  function saveAndNext() {
    if (state !== 'finished') return;
    setToast({ name: activeStudent.name, score });
    setTimeout(() => {
      setActiveIdx((i) => (i + 1) % ROSTER.length);
      setScore(0);
      setNotes('');
      setElapsed(0);
      setState('idle');
      setTweak('state', 'idle');
      setToast(null);
    }, 1500);
  }

  const overLimit = elapsed > TICKET.limitSec;
  const activeStudent = ROSTER[activeIdx] || ROSTER[0];
  const nextStudent = ROSTER[(activeIdx + 1) % ROSTER.length];

  return (
    <>
      <div className="stage" data-screen-label={`01 Proctor (${state})`}>
        <div className="frame">
          {/* Topbar */}
          <div className="top">
            <div className="crumbs">
              <span>Прокторинг</span>
              <span className="sep">/</span>
              <b>Теория вероятностей</b>
              <span className="sep">/</span>
              <span>Весенний экзамен</span>
            </div>
            <div className="spacer"></div>
            <div className="session-pill">
              <span className="led"></span>
              СЕССИЯ АКТИВНА · 12:34:08
            </div>
            <div className="icon-btn" title="Настройки"><DI.settings /></div>
          </div>

          <div className="body">
            {/* Left: roster */}
            <aside className="roster">
              <h3>Группа <span className="count">{ROSTER.length}</span></h3>
              <div className="roster-list">
                {ROSTER.map((r, i) => (
                  <div key={r.id} className={`r-row ${i === activeIdx ? 'active' : ''}`}>
                    <div className="av">{r.sig}</div>
                    <span className="name">{r.name}</span>
                    <span className="ticket">№{r.ticket}</span>
                    <span className={`status ${i === activeIdx ? 'live' : i < activeIdx ? 'done' : ''}`}></span>
                  </div>
                ))}
              </div>
            </aside>

            {/* Center: timer stage */}
            <section className="center">
              <div className="student-card">
                <div className="av-lg">{activeStudent.sig}</div>
                <div className="who">
                  <div className="name">{activeStudent.name}</div>
                  <div className="meta">
                    <span><b>ИВТ-301</b></span>
                    <span>·</span>
                    <span>№ зачётки <b>23-1284</b></span>
                    <span>·</span>
                    <span>Билет <b>№{activeStudent.ticket} из 27</b></span>
                  </div>
                </div>
                <div className="ticket-pill">Устный ответ · до {Math.round(TICKET.limitSec / 60)} мин</div>
              </div>

              <div className="question-block">
                <h2>Билет №{activeStudent.ticket}</h2>
                <div className="qcap">Студент должен ответить устно. Запустите таймер, когда он начнёт.</div>
                <p>{TICKET.question}</p>
              </div>

              {/* Timer centerpiece */}
              <div className={`timer-stage ${state === 'recording' ? 'recording' : state === 'finished' ? 'finished' : ''}`}>
                <div className="timer-state">
                  <span className="led"></span>
                  {state === 'recording' ? 'Идёт ответ' :
                   state === 'finished' ? 'Ответ завершён' :
                   'Ожидание — нажмите «Старт», когда студент начнёт'}
                </div>

                <div className="timer-display">{formatTime(elapsed)}</div>

                <div className={`timer-limit ${overLimit ? 'warn' : ''}`}>
                  {overLimit
                    ? <>Превышен лимит на <b>{formatTime(elapsed - TICKET.limitSec)}</b></>
                    : <>лимит ответа <b>{formatTime(TICKET.limitSec)}</b></>
                  }
                </div>

                <div className="timer-actions">
                  {state === 'idle' && (
                    <button className="big-btn start" onClick={startTimer}>
                      <DI.play /> Старт — студент начал
                    </button>
                  )}
                  {state === 'recording' && (
                    <button className="big-btn stop" onClick={stopTimer}>
                      <span className="rec-dot"></span> Стоп — ответ завершён
                    </button>
                  )}
                  {state === 'finished' && (
                    <>
                      <button className="big-btn reset" onClick={reset}>
                        <DI.back /> Сбросить
                      </button>
                      <button className="big-btn start" onClick={startTimer}>
                        <DI.play /> Заново
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="rating-card">
                <div className="rating-head">
                  <h4>Оценка ответа</h4>
                  <div className="score"><b>{score}</b><small> / {TICKET.maxPoints}</small></div>
                </div>
                <div className="stars">
                  {Array.from({ length: TICKET.maxPoints }, (_, i) => {
                    const filled = i < score;
                    return (
                      <span
                        key={i}
                        className={`star ${filled ? 'on' : ''}`}
                        onClick={() => setScore(i + 1 === score ? i : i + 1)}
                        title={`${i + 1} ${i === 0 ? 'балл' : 'балла'}`}
                      >
                        <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
                          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
                        </svg>
                      </span>
                    );
                  })}
                </div>
                <div className="rating-actions">
                  <button
                    className="btn primary"
                    disabled={state !== 'finished'}
                    onClick={saveAndNext}
                    style={{ opacity: state === 'finished' ? 1 : .4, cursor: state === 'finished' ? 'pointer' : 'not-allowed' }}
                  >
                    <DI.check /> Сохранить оценку и далее
                  </button>
                  <button className="btn ghost">
                    <DI.back /> Назад в список
                  </button>
                </div>
              </div>
            </section>

            {/* Right rail */}
            <aside className="rail">
              <div className="rail-section">
                <h4>Критерии оценки</h4>
                <ul className="rubric-list">
                  {TICKET.rubric.map((r, i) => (
                    <li key={i}>
                      <span className="ic">{i + 1}</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rail-section">
                <h4>Заметки</h4>
                <textarea
                  className="notes-area"
                  placeholder="Кратко: что раскрыл, что пропустил…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="rail-section">
                <h4>Следующий</h4>
                <div className="queue-card">
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: 'linear-gradient(135deg, #2A2A2A, #4a4a4a)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>
                    {nextStudent.sig}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{nextStudent.name}</div>
                    <div className="nxt">билет №{nextStudent.ticket}</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-overlay" role="status" aria-live="polite">
          <div className="toast-card">
            <div className="toast-icon"><DI.check /></div>
            <div>
              <div className="toast-title">Оценка сохранена</div>
              <div className="toast-sub">{toast.name} · {toast.score} из {TICKET.maxPoints} · вызываем следующего…</div>
            </div>
          </div>
        </div>
      )}

      <TweaksPanel title="Настройки">
        <TweakSection label="Состояние таймера" />
        <TweakRadio
          label="Этап"
          value={state}
          options={[
            { value: 'idle',      label: 'Ожид.' },
            { value: 'recording', label: 'Идёт' },
            { value: 'finished',  label: 'Готово' },
          ]}
          onChange={(v) => { setTweak('state', v); setState(v); }}
        />
        <TweakButton label="↺  Сбросить" onClick={reset} />
        <TweakSection label="Бренд" />
        <TweakColor
          label="Акцентный цвет"
          value={tweaks.accent}
          options={['#FF4D1F', '#E11D48', '#0F62FE', '#0FA968', '#7C3AED']}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
