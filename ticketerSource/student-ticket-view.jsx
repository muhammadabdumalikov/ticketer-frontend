// Ticket / exam-taking view (mirrors original reference).

const TICKET = {
  number: 7,
  questions: [
    {
      type: 'single',
      title: 'Условие',
      sub: 'Прочитайте задачу и выберите правильный ответ',
      passage: 'В компании 100 сотрудников: 60 занимаются программированием, 30 — дизайном, и 10 — менеджментом. 70% программистов знают Python, 40% дизайнеров знают Figma, и 50% менеджеров работают с Jira. Если случайно выбрать одного сотрудника, какова вероятность того, что он знает Python, Figma или Jira?',
      options: [
        '0.52 — Подсчитано суммированием вероятностей по всем трём профессиям.',
        '0.45 — Получено из доли квалифицированных сотрудников от общего числа.',
        '0.48 — Сумма долей сотрудников по распределению навыков.',
        '0.50 — Учтены независимые вероятности внутри пула сотрудников.',
      ],
      correct: 1,
      time: 90,
    },
    {
      type: 'verbal',
      title: 'Устный ответ',
      sub: 'Ответьте вслух — преподаватель слушает и оценит ваш ответ',
      passage: 'Расскажите о свойствах нормального распределения. Чем оно характеризуется? Как оно связано с центральной предельной теоремой и где применяется на практике? Приведите 1–2 примера.',
      points: 10,
      time: 5 * 60,
    },
  ],
  totalQuestions: 27,
};

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Ticket({ subject, ticketNumber, onExit, questionType = 'single', verbalStatus = 'waiting' }) {
  // Pick the question based on type tweak
  const question = questionType === 'verbal' ? TICKET.questions[1] : TICKET.questions[0];
  const isVerbal = question.type === 'verbal';

  const [selected, setSelected] = React.useState(1);
  const [currentQ, setCurrentQ] = React.useState(0);
  const [showPager, setShowPager] = React.useState(false);

  // For MCQ: countdown from question.time. For verbal: count up from 0 while teacher has started.
  const [timeLeft, setTimeLeft] = React.useState(question.time);
  const [verbalElapsed, setVerbalElapsed] = React.useState(0);

  React.useEffect(() => {
    if (isVerbal) {
      if (verbalStatus !== 'recording') return;
      const t = setInterval(() => setVerbalElapsed((x) => x + 1), 1000);
      return () => clearInterval(t);
    } else {
      const t = setInterval(() => setTimeLeft((x) => Math.max(0, x - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [isVerbal, verbalStatus]);

  const timeWarn = !isVerbal && timeLeft <= 15;

  return (
    <>
      <div className="top">
        <div className="title">
          {subject.name}
          <span className="info" title="Информация о билете">i</span>
        </div>
        <div className="spacer"></div>
        <div className={`pill-time ${timeWarn ? 'warn' : ''} ${isVerbal && verbalStatus === 'recording' ? 'rec' : ''}`}>
          {isVerbal ? (
            verbalStatus === 'recording' ? (
              <><span className="rec-dot"></span> {formatTime(verbalElapsed)}</>
            ) : verbalStatus === 'finished' ? (
              <><DI.check /> {formatTime(verbalElapsed)}</>
            ) : (
              <><DI.mic /> Ожидание</>
            )
          ) : (
            <><DI.clock /> {formatTime(timeLeft)}</>
          )}
        </div>
        <div className="tools">
          <div className="tool" title="Калькулятор"><DI.calc /></div>
          <div className="tool" title="Распределения"><DI.bars2 /></div>
          <div className="tool" title="Геометрия"><DI.triangle /></div>
          <div className="tool" title="Таблицы"><DI.table /></div>
          <div className="tool danger" title="Завершить и выйти" onClick={onExit}><DI.exit /></div>
        </div>
      </div>

      <div className="ticket-body">
        {/* Left: passage */}
        <div className="passage">
          <h2>{question.title}</h2>
          <div className="pcap">{question.sub}</div>
          <p>{question.passage}</p>
        </div>

        {/* Center grip */}
        <div className="vsep">
          <span className="grip"><DI.dots /></span>
        </div>

        {/* Right pane: verbal or MCQ */}
        {isVerbal ? (
          <div className="opts-pane verbal-pane">
            <div className="verbal-status" data-state={verbalStatus}>
              <div className="verbal-mic">
                {verbalStatus === 'recording' && <span className="verbal-ring"></span>}
                <DI.mic />
              </div>
              <div className="verbal-state-label">
                {verbalStatus === 'recording' ? 'Идёт ответ' :
                 verbalStatus === 'finished' ? 'Ответ завершён' :
                 'Приготовьтесь'}
              </div>
              <div className="verbal-state-sub">
                {verbalStatus === 'recording'
                  ? 'Говорите чётко и по существу. Преподаватель остановит таймер, когда вы закончите.'
                  : verbalStatus === 'finished'
                  ? 'Преподаватель оценивает ваш ответ. Ожидайте результат.'
                  : 'Когда вы начнёте говорить, преподаватель запустит таймер. На ответ — до {Math.round(question.time / 60)} мин.'}
              </div>
            </div>

            <ul className="verbal-tips">
              <li><DI.check /> Сформулируйте основной тезис ответа.</li>
              <li><DI.check /> Раскройте 1–2 ключевых аспекта.</li>
              <li><DI.check /> Приведите пример или приложение.</li>
            </ul>

            <div className="verbal-meta">
              <div>
                <div className="k">Лимит</div>
                <div className="v">до {Math.round(question.time / 60)} мин</div>
              </div>
              <div>
                <div className="k">Макс баллов</div>
                <div className="v">{question.points}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="opts-pane">
            <div className="opts-head no-border">Выберите правильный вариант</div>
            <div className="opts">
              {question.options.map((o, i) => {
                const isSel = selected === i;
                return (
                  <div
                    key={i}
                    className={`opt ${isSel ? 'sel' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <div className="r"></div>
                    <div>{o}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="foot">
        <div className="help" title="Помощь">?</div>
        <div
          className="pager"
          onClick={() => setShowPager((v) => !v)}
        >
          Вопрос {currentQ + 1} из {TICKET.totalQuestions}
          <span className="ch"><DI.down /></span>
        </div>
        <div className="nav">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentQ((x) => Math.max(0, x - 1))}
            disabled={currentQ === 0}
          >
            Назад
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQ((x) => Math.min(TICKET.totalQuestions - 1, x + 1))}
          >
            Далее
          </button>
        </div>
      </div>
    </>
  );
}

window.Ticket = Ticket;
