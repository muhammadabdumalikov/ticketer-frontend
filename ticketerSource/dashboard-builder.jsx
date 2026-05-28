// Exam builder — 3-step wizard

function makeQuestion(n = 1) {
  return {
    id: 'q_' + Math.random().toString(36).slice(2, 8),
    text: '',
    type: 'single',
    points: 5,
    time: 60,
    difficulty: 'medium',
    correct: 0,
    answers: ['', '', '', ''],
    rubric: '',
  };
}

function MetaField({ label, children, hint }) {
  return (
    <div className="meta-field">
      <label>{label}</label>
      <div className="val">{children}</div>
      {hint && <div className="meta-hint">{hint}</div>}
    </div>
  );
}

// ── Stepper ─────────────────────────────────────────────────────
function Stepper({ step, steps, onJump }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const state = i < step ? 'done' : i === step ? 'current' : 'todo';
        return (
          <React.Fragment key={i}>
            <button
              type="button"
              className={`step ${state}`}
              onClick={() => i <= step && onJump(i)}
              disabled={i > step}
            >
              <span className="step-num">
                {state === 'done' ? <DI.check /> : String(i + 1).padStart(2, '0')}
              </span>
              <span className="step-text">
                <span className="step-eyebrow">Шаг {i + 1}</span>
                <span className="step-label">{s}</span>
              </span>
            </button>
            {i < steps.length - 1 && <span className={`step-sep ${i < step ? 'done' : ''}`}></span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Subject ────────────────────────────────────────────
function StepSubject({ value, onChange, onAddSubject }) {
  return (
    <div className="wiz-card">
      <div className="wiz-head">
        <h2>На какой предмет создаём билет?</h2>
        <p>Выберите предмет из вашего списка или добавьте новый.</p>
      </div>

      <div className="subj-picker">
        {SUBJECTS.map((s) => (
          <button
            type="button"
            key={s.id}
            className={`subj-tile ${value?.id === s.id ? 'on' : ''}`}
            onClick={() => onChange(s)}
            style={value?.id === s.id ? { borderColor: s.color, boxShadow: `0 0 0 3px ${s.color}20` } : {}}
          >
            <div className="subj-tile-sigil" style={{ background: s.color + '18', color: s.color }}>
              {s.sigil}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="subj-tile-name">{s.name}</div>
              <div className="subj-tile-code">{s.code} · {s.tickets} билетов · {s.students} студентов</div>
            </div>
            {value?.id === s.id && (
              <div className="subj-tile-check" style={{ background: s.color }}><DI.check /></div>
            )}
          </button>
        ))}

        <button
          type="button"
          className="subj-tile add"
          onClick={onAddSubject}
        >
          <div className="subj-tile-sigil add"><DI.plus /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="subj-tile-name">Добавить новый предмет</div>
            <div className="subj-tile-code">Создайте новый предмет и сразу начните билет</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Ticket details ─────────────────────────────────────
function StepDetails({ subject, details, onChange }) {
  function set(patch) { onChange({ ...details, ...patch }); }
  return (
    <div className="wiz-card">
      <div className="wiz-head">
        <h2>Параметры билета</h2>
        <p>
          Предмет: <b style={{ color: 'var(--ink)' }}>{subject.code} — {subject.name}</b>
        </p>
      </div>

      <div className="d-grid">
        <div className="m-field" style={{ gridColumn: '1 / -1' }}>
          <label>Название билета</label>
          <input
            value={details.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="напр. Весенний итоговый экзамен"
            autoFocus
          />
        </div>

        <div className="m-field" style={{ gridColumn: '1 / -1' }}>
          <label>Описание для студентов <span className="m-hint">(не обязательно)</span></label>
          <textarea
            value={details.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Краткое описание, инструкции, разрешённые материалы…"
            rows={3}
          />
        </div>

        <div className="m-field">
          <label>Общая длительность</label>
          <div className="input-with-unit">
            <input
              type="number" min="5" max="240"
              value={details.duration}
              onChange={(e) => set({ duration: parseInt(e.target.value || '0', 10) })}
            />
            <span className="unit">мин</span>
          </div>
        </div>

        <div className="m-field">
          <label>Попыток</label>
          <input
            type="number" min="1" max="10"
            value={details.attempts}
            onChange={(e) => set({ attempts: parseInt(e.target.value || '1', 10) })}
          />
        </div>

        <div className="m-field">
          <label>Доступ</label>
          <Dropdown
            value={details.visibility}
            onChange={(v) => set({ visibility: v })}
            variant="solid"
            icon={<DI.eye />}
            options={[
              { value: 'private',    label: 'Только записанные студенты', hint: 'Доступно по списку группы' },
              { value: 'department', label: 'Кафедра',                  hint: 'Все преподаватели кафедры видят билет' },
              { value: 'public',     label: 'Публичная ссылка',           hint: 'Любой, у кого есть ссылка' },
            ]}
          />
        </div>

        <div className="m-field">
          <label>Порядок вопросов</label>
          <Dropdown
            value={details.shuffle}
            onChange={(v) => set({ shuffle: v })}
            variant="solid"
            icon={<DI.list />}
            options={[
              { value: 'fixed',       label: 'Фиксированный',  hint: 'В том же порядке, что вы ввели' },
              { value: 'shuffle',     label: 'Перемешать',     hint: 'Каждый студент — своя последовательность' },
              { value: 'random-bank', label: 'Случайно из банка', hint: 'Брать по тагам из банка вопросов' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Questions ──────────────────────────────────────────
function QuestionCard({ q, index, total, onChange, onRemove, onDuplicate, onMove }) {
  function setQ(patch) { onChange({ ...q, ...patch }); }
  function setAnswer(i, v) {
    const next = q.answers.slice();
    next[i] = v;
    setQ({ answers: next });
  }
  function removeAnswer(i) {
    if (q.answers.length <= 2) return;
    const next = q.answers.filter((_, j) => j !== i);
    let correct = q.correct;
    if (i < correct) correct -= 1;
    else if (i === correct) correct = 0;
    setQ({ answers: next, correct });
  }
  function addAnswer() {
    if (q.answers.length >= 6) return;
    setQ({ answers: [...q.answers, ''] });
  }

  const typeLabel = q.type === 'single' ? 'Один вариант' :
    q.type === 'multi' ? 'Несколько вариантов' :
    q.type === 'text' ? 'Текстовый ответ' :
    q.type === 'verbal' ? 'Устный ответ' :
    'Числовой ответ';

  const isVerbal = q.type === 'verbal';

  return (
    <div className="q-card" data-screen-label={`Вопрос ${index + 1}`}>
      <div className="q-head">
        <span className="q-num">В · {String(index + 1).padStart(2, '0')}</span>
        <span className="q-type-pill"><DI.list /> {typeLabel}</span>
        {isVerbal && (
          <span className="q-type-pill" style={{ background: '#EEF0FF', color: '#3346D1' }}>
            <DI.mic /> Оценка вручную
          </span>
        )}
        <span className="q-type-pill" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <DI.bolt /> до {q.points} баллов · {isVerbal ? `до ${Math.round(q.time / 60)} мин` : `${q.time}с`}
        </span>
        <div className="spacer"></div>
        <span className="iconbtn" title="Вверх" onClick={() => onMove(index, -1)}><DI.up /></span>
        <span className="iconbtn" title="Вниз" onClick={() => onMove(index, +1)}><DI.down /></span>
        <span className="iconbtn" title="Дублировать" onClick={onDuplicate}><DI.copy /></span>
        <span className="iconbtn danger" title="Удалить" onClick={onRemove}><DI.trash /></span>
      </div>

      <textarea
        className="q-text"
        placeholder={isVerbal
          ? `Введите вопрос №${index + 1} для устного ответа…\n\nнапр. «Расскажите о свойствах нормального распределения и его применении на практике»`
          : `Введите вопрос №${index + 1}…\n\nнапр. «В компании 100 сотрудников: 60 занимаются программированием…»`
        }
        value={q.text}
        onChange={(e) => setQ({ text: e.target.value })}
      />

      {isVerbal ? (
        <>
          <div className="verbal-block">
            <div className="m-field">
              <label>Ключевые моменты / критерии оценки <span className="m-hint">(видно только преподавателю)</span></label>
              <textarea
                rows={4}
                value={q.rubric || ''}
                onChange={(e) => setQ({ rubric: e.target.value })}
                placeholder="Перечислите тезисы, которые студент должен раскрыть, или рубрику оценки…Что считается полным ответом, что — частичным"
              />
            </div>
          </div>

          {/* Mini preview of the teacher grading UI during the exam */}
          <div className="verbal-preview">
            <div className="verbal-preview-head">
              <div className="label-mono">Как это выглядит во время экзамена</div>
              <span className="q-type-pill" style={{ background: '#fff', color: 'var(--muted)' }}>превью</span>
            </div>
            <div className="verbal-preview-body">
              <div className="vp-timer">
                <div className="vp-timer-display">00:00</div>
                <div className="vp-timer-meta">лимит до {Math.round(q.time / 60)} мин</div>
              </div>
              <button type="button" className="vp-start" tabIndex={-1}>
                <span className="vp-rec"></span> Старт — студент начал отвечать
              </button>
              <div className="vp-rating">
                <div className="vp-rating-label">
                  <span>Баллы</span>
                  <span className="vp-rating-val"><b>3</b> / {q.points}</span>
                </div>
                <div className="vp-stars">
                  {Array.from({ length: Math.min(q.points, 10) }, (_, i) => {
                    const filled = i < 3;
                    return (
                      <span key={i} className={`vp-star ${filled ? 'on' : ''}`} aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24"
                          fill={filled ? 'currentColor' : 'none'}
                          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
                        </svg>
                      </span>
                    );
                  })}
                  {q.points > 10 && (
                    <span className="vp-stars-more">· из {q.points}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="answers">
          {q.answers.map((a, i) => (
            <div key={i} className={`answer ${q.correct === i ? 'correct' : ''}`}>
              <div className="radio" onClick={() => setQ({ correct: i })} title="Отметить как правильный"></div>
              <input
                className="atext"
                placeholder={`Вариант ${String.fromCharCode(1040 + i)}`}
                value={a}
                onChange={(e) => setAnswer(i, e.target.value)}
              />
              <div className="remove" onClick={() => removeAnswer(i)} title="Удалить"><DI.trash /></div>
            </div>
          ))}
          <button type="button" className="add-answer" onClick={addAnswer}>
            <DI.plus /> Добавить вариант ответа
          </button>
        </div>
      )}

      <div className="q-foot">
        <MetaField label={isVerbal ? "Максимум баллов" : "Баллы за правильный ответ"}>
          <DI.star />
          <input type="number" min="0" max="100" value={q.points} onChange={(e) => setQ({ points: parseInt(e.target.value || '0', 10) })} />
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>баллов</span>
        </MetaField>
        <MetaField label={isVerbal ? "Лимит на ответ" : "Время на ответ"}>
          <DI.clock />
          {isVerbal ? (
            <>
              <input type="number" min="1" max="30" value={Math.max(1, Math.round(q.time / 60))} onChange={(e) => setQ({ time: parseInt(e.target.value || '1', 10) * 60 })} />
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>мин</span>
            </>
          ) : (
            <>
              <input type="number" min="10" max="900" step="10" value={q.time} onChange={(e) => setQ({ time: parseInt(e.target.value || '0', 10) })} />
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>сек</span>
            </>
          )}
        </MetaField>
        <MetaField label="Сложность">
          <DI.bolt />
          <Dropdown
            value={q.difficulty}
            onChange={(v) => setQ({ difficulty: v })}
            variant="inline"
            options={[
              { value: 'easy',   label: 'Лёгкая' },
              { value: 'medium', label: 'Средняя' },
              { value: 'hard',   label: 'Сложная' },
            ]}
          />
        </MetaField>
        <MetaField label="Тип вопроса">
          <DI.list />
          <Dropdown
            value={q.type}
            onChange={(v) => setQ({ type: v })}
            variant="inline"
            options={[
              { value: 'single',  label: 'Один вариант' },
              { value: 'multi',   label: 'Несколько вариантов' },
              { value: 'text',    label: 'Текстовый ответ' },
              { value: 'numeric', label: 'Числовой ответ' },
              { value: 'verbal',  label: 'Устный ответ', hint: 'Оценка вручную преподавателем' },
            ]}
          />
        </MetaField>
      </div>
    </div>
  );
}

function StepQuestions({ subject, details, questions, setQuestions }) {
  function update(i, q) { const next = questions.slice(); next[i] = q; setQuestions(next); }
  function remove(i) { if (questions.length === 1) return; setQuestions(questions.filter((_, j) => j !== i)); }
  function duplicate(i) {
    const dup = { ...questions[i], id: 'q_' + Math.random().toString(36).slice(2, 8), answers: questions[i].answers.slice() };
    const next = questions.slice(); next.splice(i + 1, 0, dup); setQuestions(next);
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = questions.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next);
  }

  return (
    <>
      <div className="wiz-card" style={{ paddingBottom: 18 }}>
        <div className="wiz-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16 }}>
          <div>
            <h2>{details.title || 'Билет без названия'}</h2>
            <p>{subject.code} — {subject.name} · {details.duration} мин · {questions.length} вопр.</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm"><DI.eye /> Предпросмотр</button>
        </div>
      </div>

      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={i}
          total={questions.length}
          onChange={(nq) => update(i, nq)}
          onRemove={() => remove(i)}
          onDuplicate={() => duplicate(i)}
          onMove={move}
        />
      ))}

      <button
        type="button"
        className="add-question"
        onClick={() => setQuestions([...questions, makeQuestion()])}
      >
        <DI.plus /> Добавить вопрос
      </button>
    </>
  );
}

// ── Wizard root ────────────────────────────────────────────────
function BuilderView({ subject: initialSubject, onBack, onAddSubject, startStep = 0, returnLabel = 'Назад' }) {
  const [step, setStep] = React.useState(startStep);
  const [subject, setSubject] = React.useState(initialSubject || null);
  const [details, setDetails] = React.useState({
    title: '',
    description: '',
    duration: 90,
    attempts: 1,
    visibility: 'private',
    shuffle: 'fixed',
  });
  const [questions, setQuestions] = React.useState([makeQuestion()]);
  const [published, setPublished] = React.useState(null);
  const [createdCount, setCreatedCount] = React.useState(0);

  // If a new subject was added externally, auto-select the latest
  React.useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
  }, [initialSubject]);

  const steps = ['Предмет', 'Параметры', 'Вопросы'];

  const canNext = (
    (step === 0 && subject) ||
    (step === 1 && details.title.trim().length >= 2) ||
    (step === 2 && questions.length > 0 && questions[0].text.trim().length > 0)
  );

  const totalPoints = questions.reduce((s, q) => s + (q.points || 0), 0);
  const totalTimeMin = Math.round(questions.reduce((s, q) => s + (q.time || 0), 0) / 60);

  function next() {
    if (!canNext) return;
    if (step < steps.length - 1) setStep(step + 1);
    else publish();
  }
  function publish() {
    const newTicket = {
      id: 't_' + Math.random().toString(36).slice(2, 8),
      title: details.title.trim(),
      status: 'Опубликован',
      q: questions.length,
      time: `${details.duration} мин`,
      updated: 'Только что',
      author: 'Вы',
    };
    if (!window.EXAMS[subject.id]) window.EXAMS[subject.id] = [];
    window.EXAMS[subject.id].unshift(newTicket);
    const sIdx = window.SUBJECTS.findIndex((s) => s.id === subject.id);
    if (sIdx >= 0) {
      window.SUBJECTS[sIdx] = {
        ...window.SUBJECTS[sIdx],
        tickets: window.SUBJECTS[sIdx].tickets + 1,
        exams: window.SUBJECTS[sIdx].exams + 1,
      };
    }
    setPublished({
      title: details.title.trim(),
      subject,
      totalPoints,
      count: questions.length,
      duration: details.duration,
    });
    setCreatedCount((c) => c + 1);
  }

  function startAnother() {
    setDetails({
      title: '',
      description: '',
      duration: 90,
      attempts: 1,
      visibility: 'private',
      shuffle: 'fixed',
    });
    setQuestions([makeQuestion()]);
    setPublished(null);
    setStep(1);
  }

  // ── Completion screen ─────────────────────────────────────────
  if (published) {
    return (
      <div className="done-screen">
        <div className="done-card">
          <div className="done-icon"><DI.check /></div>
          <div className="done-eyebrow">БИЛЕТ ОПУБЛИКОВАН</div>
          <h2>«{published.title}»</h2>
          <p>
            Билет для <b>{published.subject.code} — {published.subject.name}</b>{' '}
            сохранён и доступен записанным студентам.
          </p>

          <div className="done-stats">
            <div>
              <div className="k">Вопросов</div>
              <div className="v">{published.count}</div>
            </div>
            <div>
              <div className="k">Баллов</div>
              <div className="v">{published.totalPoints}</div>
            </div>
            <div>
              <div className="k">Длительность</div>
              <div className="v">{published.duration}<small> мин</small></div>
            </div>
            <div>
              <div className="k">Создано в сессии</div>
              <div className="v">{createdCount}<small> {createdCount === 1 ? 'билет' : createdCount < 5 ? 'билета' : 'билетов'}</small></div>
            </div>
          </div>

          <div className="done-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={startAnother}
              style={{ background: 'var(--accent)' }}
            >
              <DI.plus /> Создать ещё билет для {published.subject.code}
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={onBack}
            >
              Готово — {returnLabel} <DI.arrow />
            </button>
          </div>

          <div className="done-foot">
            <span className="label-mono">или</span>
            <button className="link-btn" onClick={() => { setPublished(null); setStep(2); }}>
              продолжить редактировать этот билет
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wiz-top">
        <button className="btn btn-ghost btn-sm" onClick={onBack}><DI.back /> {returnLabel}</button>
        <Stepper step={step} steps={steps} onJump={(i) => setStep(i)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="pill orange">ЧЕРНОВИК</span>
        </div>
      </div>

      {step === 0 && (
        <StepSubject
          value={subject}
          onChange={setSubject}
          onAddSubject={onAddSubject}
        />
      )}
      {step === 1 && subject && (
        <StepDetails subject={subject} details={details} onChange={setDetails} />
      )}
      {step === 2 && subject && (
        <StepQuestions
          subject={subject}
          details={details}
          questions={questions}
          setQuestions={setQuestions}
        />
      )}

      <div className="save-bar">
        <div className="info">
          <div className="it">
            <span className="k">Шаг</span>
            <span className="v">{step + 1} / {steps.length}</span>
          </div>
          {subject && (
            <div className="it">
              <span className="k">Предмет</span>
              <span className="v">{subject.code}</span>
            </div>
          )}
          {step >= 1 && (
            <div className="it">
              <span className="k">Длительность</span>
              <span className="v">{details.duration} мин</span>
            </div>
          )}
          {step >= 2 && (
            <>
              <div className="it">
                <span className="k">Вопросов</span>
                <span className="v">{questions.length}</span>
              </div>
              <div className="it">
                <span className="k">Баллов</span>
                <span className="v">{totalPoints}</span>
              </div>
              <div className="it">
                <span className="k">Таймеры</span>
                <span className="v">{totalTimeMin} мин</span>
              </div>
            </>
          )}
        </div>
        <div className="spacer"></div>

        {step > 0 && (
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}
            onClick={() => setStep(step - 1)}
          >
            <DI.back /> Назад
          </button>
        )}
        <button
          className="btn"
          style={{
            background: canNext ? 'var(--accent)' : 'rgba(255,255,255,.15)',
            color: '#fff', opacity: canNext ? 1 : .5, cursor: canNext ? 'pointer' : 'not-allowed',
          }}
          onClick={next}
          disabled={!canNext}
        >
          {step < steps.length - 1
            ? <>Далее <DI.arrow /></>
            : <>Опубликовать билет <DI.arrow /></>
          }
        </button>
      </div>
    </>
  );
}

window.BuilderView = BuilderView;
