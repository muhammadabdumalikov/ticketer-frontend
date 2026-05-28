// Ticketer — Login app

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "split",
  "accent": "#FF4D1F",
  "showSSO": true,
  "showRoleTabs": true,
  "showInstitutionField": false,
  "headlineMode": "ticket"
}/*EDITMODE-END*/;

// ── Icons ─────────────────────────────────────────────────────────
const I = {
  mail: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>,
  lock: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>,
  building: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21V6l8-3 8 3v15"/><path d="M4 21h16"/><path d="M9 21V11"/><path d="M15 21V11"/><path d="M9 7h.01M15 7h.01"/></svg>,
  eye: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.3 4M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6c1.5 0 2.9-.3 4-.8"/><path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-5.1"/></svg>,
  check: (p) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="4 12 10 18 20 6"/></svg>,
  arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  loader: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>,
  gradCap: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9l9-4 9 4-9 4-9-4z"/><path d="M7 11v5c0 .9 2.5 2 5 2s5-1.1 5-2v-5"/><path d="M21 9v5"/></svg>,
  user: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  key: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/></svg>,
  google: () => <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.3-13.3l5.7-5.6A20 20 0 1 0 44 24a20 20 0 0 0-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 8 3l5.7-5.6A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28L6.2 33A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3A20 20 0 0 0 44 24a20 20 0 0 0-.4-3.5z"/></svg>,
  ms: () => <svg width="16" height="16" viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" fill="#F25022"/><rect x="13" y="2" width="9" height="9" fill="#7FBA00"/><rect x="2" y="13" width="9" height="9" fill="#00A4EF"/><rect x="13" y="13" width="9" height="9" fill="#FFB900"/></svg>,
  shield: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  calc: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h2M12 19h2M16 19h.01"/></svg>,
  bars: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 20V10M12 20V4M18 20v-6"/></svg>,
  exit: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 12h12M16 7l5 5-5 5"/><path d="M14 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"/></svg>,
  triangle: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 16H3z"/></svg>,
  table: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 11h18M9 5v14"/></svg>,
  eyeSmall: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ── Brand pane (left side of split layout) ────────────────────────
function BrandPane({ headline }) {
  const heads = {
    ticket: <>Управляйте билетами экзаменов <em>без бумажной волокиты.</em></>,
    secure: <>Безопасные билеты для <em>университетских экзаменов.</em></>,
    fair:   <>Честно, под контролем, <em>и очень просто.</em></>,
  };
  return (
    <aside className="brand">
      <div className="row">
        <div className="logo" aria-hidden="true"></div>
        <div className="wordmark">ticketer<span>.</span></div>
      </div>

      <h1>{heads[headline] || heads.ticket}</h1>
      <p className="sub">
        Рабочее пространство для билетов университетских преподавателей.
        Создавайте банки вопросов, планируйте сессии, проводите экзамены и оценивайте — всё в одном месте.
      </p>

      <div className="spec">
        <div className="label">Сегодня в Ticketer</div>
        <div className="item">
          <div className="num">01</div>
          <div className="it"><b>Теория вероятностей — Весенний экзамен</b><br/><span>Открытие в 14:00 · 27 вопросов · 90 мин</span></div>
        </div>
        <div className="item">
          <div className="num">02</div>
          <div className="it"><b>Дискретная математика — Пересдача</b><br/><span>4 студента · с прокторингом</span></div>
        </div>
        <div className="item">
          <div className="num">03</div>
          <div className="it"><b>Математический анализ II — Проверка банка</b><br/><span>12 новых вопросов на проверке</span></div>
        </div>
      </div>

      <div className="meta">
        <div>
          <div className="k">Преподавателей</div>
          <div className="v">2 840</div>
        </div>
        <div>
          <div className="k">Сессий / мес</div>
          <div className="v">18,6<small>тыс.</small></div>
        </div>
        <div>
          <div className="k">Университетов</div>
          <div className="v">112</div>
        </div>
      </div>
    </aside>
  );
}

// ── Form pane ────────────────────────────────────────────────────
function FormPane({ tweaks, setTweak }) {
  const [role, setRole] = React.useState('teacher');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [institution, setInstitution] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const formRef = React.useRef(null);

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6
    && (!tweaks.showInstitutionField || institution.length >= 2);

  function submit(e) {
    e && e.preventDefault();
    setError('');
    if (!valid) {
      setError('Введите корректную почту и пароль (минимум 6 символов).');
      formRef.current?.classList.remove('shake');
      void formRef.current?.offsetWidth;
      formRef.current?.classList.add('shake');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // mock: trigger a success state
      setError('');
      alert(`Вход выполнен как ${role === 'teacher' ? 'преподаватель' : 'администратор'} — ${email}`);
    }, 1100);
  }

  return (
    <section className="form-pane" data-screen-label="Вход">
      <div className="topline">
        <span>Новый пользователь? <a href="#" onClick={(e) => e.preventDefault()}>Запросить доступ преподавателя</a></span>
        <span style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}>
          <I.shield /> SSO + 2FA доступны
        </span>
      </div>

      <div className="formhead">
        <h2>С возвращением.</h2>
        <p>Войдите, чтобы управлять билетами, банками вопросов и сессиями.</p>
      </div>

      {tweaks.showRoleTabs && (
        <div className="tabs" role="tablist" aria-label="Account role">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'teacher'}
            className={role === 'teacher' ? 'active' : ''}
            onClick={() => setRole('teacher')}
          >
            <span className="dot-s"></span>
            <I.gradCap />
            Преподаватель
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'admin'}
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            <span className="dot-s"></span>
            <I.user />
            Администратор кафедры
          </button>
        </div>
      )}

      <form ref={formRef} onSubmit={submit} style={{display:'flex', flexDirection:'column', gap: 18}}>
        {tweaks.showInstitutionField && (
          <div className="field">
            <label htmlFor="inst">Учебное заведение</label>
            <div className="control">
              <span className="lead"><I.building /></span>
              <input
                id="inst"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="напр. Государственный университет · Факультет информатики"
                autoComplete="organization"
              />
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Университетская почта</label>
          <div className="control">
            <span className="lead"><I.mail /></span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pw">
            Пароль
            <span className="hint">минимум 6 символов</span>
          </label>
          <div className="control">
            <span className="lead"><I.lock /></span>
            <input
              id="pw"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
            <span className="trail" onClick={() => setShowPw((v) => !v)} title={showPw ? 'Скрыть' : 'Показать'}>
              {showPw ? <I.eyeOff /> : <I.eye />}
            </span>
          </div>
        </div>

        <div className="check-row">
          <div
            className={`check ${remember ? 'on' : ''}`}
            onClick={() => setRemember((v) => !v)}
            role="checkbox"
            aria-checked={remember}
            tabIndex={0}
          >
            <div className="box"><I.check /></div>
            Запомнить меня на этом устройстве
          </div>
          <a href="#" className="forgot" onClick={(e) => e.preventDefault()}>Забыли пароль?</a>
        </div>

        {error && (
          <div className="err-banner" role="alert">
            <I.triangle />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '18px 22px', fontSize: 15.5 }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={{display:'inline-flex', animation:'spin 1s linear infinite'}}>
                <I.loader />
              </span>
              Проверка данных…
            </>
          ) : (
            <>
              Войти в Ticketer
              <I.arrow />
            </>
          )}
        </button>

        {tweaks.showSSO && (
          <>
            <div className="divider">или войти через</div>
            <div className="sso">
              <button type="button" className="btn btn-ghost">
                <I.google />
                Google Workspace
              </button>
              <button type="button" className="btn btn-ghost">
                <I.ms />
                Microsoft EDU
              </button>
            </div>
          </>
        )}
      </form>

      <div className="foot">
        <span className="status"><span className="led"></span>Все системы работают</span>
        <span style={{display:'flex', gap:16}}>
          <a href="#" onClick={(e)=>e.preventDefault()}>Конфиденциальность</a>
          <a href="#" onClick={(e)=>e.preventDefault()}>Условия</a>
          <a href="#" onClick={(e)=>e.preventDefault()}>v2.4.1</a>
        </span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

// ── Centered (single-card) layout ────────────────────────────────
function CenteredLayout({ tweaks, setTweak }) {
  return (
    <div className="frame center">
      <div className="card-center">
        <div className="brand-row">
          <div style={{width:36, height:36, borderRadius:10, background:'var(--ink)', position:'relative'}}>
            <span style={{position:'absolute', inset:9, background:'var(--accent)', borderRadius:3}}></span>
          </div>
          <div style={{fontSize:22, fontWeight:600, letterSpacing:'-0.025em'}}>
            ticketer<span style={{color:'var(--accent)'}}>.</span>
          </div>
        </div>
        <FormPane tweaks={tweaks} setTweak={setTweak} />
      </div>
    </div>
  );
}

// ── Exam-preview layout (mirrors reference more literally) ───────
function ExamLayout({ tweaks, setTweak }) {
  return (
    <div className="frame exam">
      <div className="topbar">
        <div className="brand-mini">
          <span className="dot"></span>
          ticketer<span style={{color:'var(--accent)'}}>.</span>
        </div>
        <div className="spacer"></div>
        <div className="pill"><I.eyeSmall /> Preview · 00:39</div>
        <div className="icons">
          <div className="ibtn"><I.calc /></div>
          <div className="ibtn"><I.bars /></div>
          <div className="ibtn"><I.triangle /></div>
          <div className="ibtn"><I.table /></div>
          <div className="ibtn danger"><I.exit /></div>
        </div>
      </div>

      <aside className="preview">
        <div style={{display:'flex', alignItems:'center', gap: 10, color:'var(--muted)', fontSize: 13, fontFamily:'Geist Mono, monospace'}}>
          <I.key /> ПРИМЕР БИЛЕТА · ЗАБЛОКИРОВАН ДО ВХОДА
        </div>
        <div className="pcard" style={{position:'relative'}}>
          <div className="ptitle">Условие</div>
          <div className="ptag">Прочитайте задачу и выберите правильный ответ</div>
          <p>
            В компании 100 сотрудников: 60 занимаются программированием, 30 — дизайном,
            и 10 — менеджментом. 70% программистов знают Python, 40% дизайнеров знают Figma,
            и 50% менеджеров работают с Jira…
          </p>
          <div className="options" aria-hidden="true">
            <div className="opt"><span className="r"></span>0.52 — Сумма вероятностей по трём профессиям…</div>
            <div className="opt sel"><span className="r"></span>0.45 — Доля квалифицированных сотрудников от общего числа.</div>
            <div className="opt"><span className="r"></span>0.48 — Сумма долей по распределению навыков…</div>
          </div>
          <div className="lockcurtain" style={{position:'absolute', inset:0, borderRadius:20}}>
            <div className="lockmsg">
              <I.lock /> Войдите, чтобы открыть билет
            </div>
          </div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--muted)', fontSize:13}}>
          <span>Теория вероятностей и статистика · Вопрос 1 из 27</span>
          <span style={{fontFamily:'Geist Mono, monospace'}}>режим предпросмотра</span>
        </div>
      </aside>

      <FormPane tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

// ── Split layout (default) ───────────────────────────────────────
function SplitLayout({ tweaks, setTweak }) {
  return (
    <div className="frame split">
      <BrandPane headline={tweaks.headlineMode} />
      <FormPane tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

// ── App root ─────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Reflect accent into CSS var
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    // derive a soft accent
    document.documentElement.style.setProperty('--accent-soft', tweaks.accent + '1F');
  }, [tweaks.accent]);

  const layouts = {
    split: <SplitLayout tweaks={tweaks} setTweak={setTweak} />,
    center: <CenteredLayout tweaks={tweaks} setTweak={setTweak} />,
    exam: <ExamLayout tweaks={tweaks} setTweak={setTweak} />,
  };

  return (
    <>
      <div className="stage" data-screen-label="01 Sign in">
        {layouts[tweaks.layout] || layouts.split}
      </div>

      <TweaksPanel title="Настройки">
        <TweakSection label="Раскладка" />
        <TweakRadio
          label="Вариант"
          value={tweaks.layout}
          options={[
            { value: 'split',  label: 'Сплит' },
            { value: 'center', label: 'Центр' },
            { value: 'exam',   label: 'Экзамен' },
          ]}
          onChange={(v) => setTweak('layout', v)}
        />
        {tweaks.layout === 'split' && (
          <TweakSelect
            label="Заголовок"
            value={tweaks.headlineMode}
            options={[
              { value: 'ticket', label: 'Управляйте билетами' },
              { value: 'secure', label: 'Безопасные билеты' },
              { value: 'fair',   label: 'Честно и просто' },
            ]}
            onChange={(v) => setTweak('headlineMode', v)}
          />
        )}

        <TweakSection label="Форма" />
        <TweakToggle label="Вкладки роли (Преподаватель / Админ)" value={tweaks.showRoleTabs} onChange={(v) => setTweak('showRoleTabs', v)} />
        <TweakToggle label="Поле «Учебное заведение»" value={tweaks.showInstitutionField} onChange={(v) => setTweak('showInstitutionField', v)} />
        <TweakToggle label="Кнопки SSO" value={tweaks.showSSO} onChange={(v) => setTweak('showSSO', v)} />

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
