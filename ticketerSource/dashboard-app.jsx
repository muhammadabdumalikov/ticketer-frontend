// Main dashboard app — routes between views

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF4D1F",
  "sidebarVariant": "default"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState('home'); // 'home' | 'subjects' | 'subject' | 'builder' | 'tickets'
  const [activeSubject, setActiveSubject] = React.useState(null);
  const [activeExam, setActiveExam] = React.useState(null);
  const [builderStart, setBuilderStart] = React.useState(0);
  const [builderReturn, setBuilderReturn] = React.useState('home');
  const [showAddSubject, setShowAddSubject] = React.useState(false);
  const [, setSubjVersion] = React.useState(0);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-soft', tweaks.accent + '20');
  }, [tweaks.accent]);

  function addSubject(s) {
    window.SUBJECTS.push(s);
    setSubjVersion((v) => v + 1);
  }

  // Top-level nav handler (sidebar)
  function navigate(id) {
    if (id === 'home')     return setView('home');
    if (id === 'subjects') return setView('subjects');
    if (id === 'tickets')  return setView('tickets');
    if (id === 'sessions') return setView('home');
    if (id === 'bank')     return setView('home');
    if (id === 'analytics')return setView('home');
    setView('home');
  }

  function openSubject(s) {
    setActiveSubject(s);
    setView('subject');
  }
  function createExam(subject) {
    // Remember where the user was, so "Готово" / back routes correctly.
    setBuilderReturn(view);
    // From a subject context: skip directly to step 2 (details)
    // From global "Create exam": start at step 1 (subject picker)
    if (subject) {
      setActiveSubject(subject);
      setBuilderStart(1);
    } else {
      setActiveSubject(null);
      setBuilderStart(0);
    }
    setActiveExam(null);
    setView('builder');
  }
  function openExam(e) {
    setBuilderReturn(view);
    setActiveExam(e);
    setBuilderStart(1);
    setView('builder');
  }

  function returnFromBuilder() {
    setView(builderReturn || 'home');
  }

  const returnLabel =
    builderReturn === 'home'     ? 'На Главную' :
    builderReturn === 'subjects' ? 'К предметам' :
    builderReturn === 'tickets'  ? 'К билетам' :
    builderReturn === 'subject'  ? `К предмету ${activeSubject?.code || ''}`.trim() :
    'Назад';

  // Breadcrumbs per view
  const crumbs =
    view === 'home' ? [{ label: 'Рабочее пространство' }, { label: 'Главная' }]
    : view === 'subjects' ? [
        { label: 'Рабочее пространство' },
        { label: 'Предметы' },
      ]
    : view === 'tickets' ? [
        { label: 'Рабочее пространство' },
        { label: 'Билеты' },
      ]
    : view === 'subject' ? [
        { label: 'Рабочее пространство' },
        { label: 'Предметы', onClick: () => setView('subjects') },
        { label: activeSubject?.name || 'Предмет' },
      ]
    : [
        { label: 'Рабочее пространство' },
        { label: 'Предметы', onClick: () => setView('subjects') },
        { label: activeSubject?.name || 'Предмет', onClick: () => setView('subject') },
        { label: 'Новый экзамен' },
      ];

  const sidebarActive =
    view === 'home' ? 'home' :
    view === 'subjects' ? 'subjects' :
    view === 'tickets' ? 'tickets' :
    view === 'subject' ? 'subjects' :
    view === 'builder' ? (builderReturn === 'tickets' ? 'tickets' : builderReturn === 'home' ? 'home' : 'subjects') :
    'home';

  const totalTickets = SUBJECTS.reduce((s, x) => s + x.tickets, 0);

  return (
    <>
      <div className="app" data-screen-label={`01 ${view}`}>
        <Sidebar
          active={sidebarActive}
          onNavigate={navigate}
          counts={{ subjects: SUBJECTS.length, tickets: totalTickets }}
        />
        <main className="main">
          <Topbar
            crumbs={crumbs}
            onPrimary={(view === 'builder' || view === 'home') ? null : () => createExam(activeSubject)}
            primaryLabel={view === 'subject' ? 'Новый экзамен' : 'Создать экзамен'}
          />

          {view === 'home' && (
            <HomeView
              onOpenSubject={openSubject}
              onCreate={() => createExam(null)}
              onAddSubject={() => setShowAddSubject(true)}
            />
          )}
          {view === 'subjects' && (
            <SubjectsListView
              onOpenSubject={openSubject}
              onCreateExam={createExam}
              onAddSubject={() => setShowAddSubject(true)}
            />
          )}
          {view === 'tickets' && (
            <TicketsView
              onOpenSubject={openSubject}
              onCreateExam={createExam}
            />
          )}
          {view === 'subject' && activeSubject && (
            <SubjectView
              subject={activeSubject}
              onBack={() => setView('subjects')}
              onCreateExam={createExam}
              onOpenExam={openExam}
            />
          )}
          {view === 'builder' && (
            <BuilderView
              subject={activeSubject}
              startStep={builderStart}
              onBack={returnFromBuilder}
              returnLabel={returnLabel}
              onAddSubject={() => setShowAddSubject(true)}
            />
          )}
        </main>
      </div>

      <AddSubjectModal
        open={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        onAdd={(s) => addSubject(s)}
      />

      <TweaksPanel title="Настройки">
        <TweakSection label="Бренд" />
        <TweakColor
          label="Акцентный цвет"
          value={tweaks.accent}
          options={['#FF4D1F', '#E11D48', '#0F62FE', '#0FA968', '#7C3AED']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakSection label="Быстрый переход" />
        <TweakButton label="На Главную"             onClick={() => setView('home')} />
        <TweakButton label="Предметы"               onClick={() => setView('subjects')} />
        <TweakButton label="Билеты"                  onClick={() => setView('tickets')} />
        <TweakButton label="Открыть первый предмет"   onClick={() => openSubject(SUBJECTS[0])} />
        <TweakButton label="Конструктор экзамена"    onClick={() => createExam(SUBJECTS[0])} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
