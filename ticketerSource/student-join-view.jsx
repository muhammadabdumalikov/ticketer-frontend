// Join screen — student enters name + group before joining the room

function Join({ examInfo, onJoin }) {
  const [name, setName] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [ready, setReady] = React.useState(false);

  const valid = name.trim().length >= 3 && group.trim().length >= 2;

  function submit(e) {
    e && e.preventDefault();
    if (!valid) return;
    onJoin({ name: name.trim(), group: group.trim(), studentId: studentId.trim() });
  }

  return (
    <>
      <div className="top">
        <div className="title">
          <span className="logo-mini">
            <span className="logo-dot"></span>
          </span>
          ticketer<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div className="spacer"></div>
        <div className="pill-time">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--green)', display: 'inline-block' }}></span>
          Сессия открыта
        </div>
      </div>

      <div className="join-body">
        <div className="join-left">
          <div className="wait-eyebrow">
            <span className="pulse"></span>
            ВЫ ПРИГЛАШЕНЫ НА ЭКЗАМЕН
          </div>

          <h1 className="wait-headline">
            {examInfo.subject}.<br />
            <em>Войдите в комнату, чтобы начать.</em>
          </h1>

          <p className="wait-sub">
            Введите ваше имя и группу — преподаватель увидит, что вы подключились.
            Сразу после входа вы попадёте в комнату ожидания. Когда все будут готовы,
            преподаватель запустит сессию и вам выпадет случайный билет.
          </p>

          <div className="wait-meta">
            <div className="it">
              <div className="k">Преподаватель</div>
              <div className="v">{examInfo.teacher}</div>
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
              <div className="v">{examInfo.duration}<small> мин на билет</small></div>
            </div>
          </div>
        </div>

        <form className="join-right" onSubmit={submit}>
          <div className="join-card-head">
            <h3>Вход в сессию</h3>
            <p>Эти данные увидят только преподаватель и комиссия.</p>
          </div>

          <div className="j-field">
            <label>Фамилия и имя</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Михаил Соколов"
              autoFocus
              autoComplete="name"
            />
          </div>

          <div className="join-row">
            <div className="j-field">
              <label>Группа</label>
              <input
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="ИВТ-301"
                autoComplete="off"
              />
            </div>
            <div className="j-field">
              <label>№ зачётки <span className="m-hint">(не обязательно)</span></label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="например 23-1284"
                autoComplete="off"
              />
            </div>
          </div>

          <label
            className="j-check"
            onClick={() => setReady((v) => !v)}
          >
            <span className={`j-box ${ready ? 'on' : ''}`}>{ready && <DI.check />}</span>
            <span>
              Я подтверждаю, что готов сдавать экзамен самостоятельно и не использую
              запрещённые материалы.
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!valid || !ready}
            style={{ width: '100%', opacity: (valid && ready) ? 1 : .45, cursor: (valid && ready) ? 'pointer' : 'not-allowed' }}
          >
            Войти в комнату <DI.arrow />
          </button>

          <div className="j-foot">
            <DI.shield /> Защищённая сессия · Все действия логируются
          </div>
        </form>
      </div>
    </>
  );
}

window.Join = Join;
