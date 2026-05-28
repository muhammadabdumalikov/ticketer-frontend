// Student app — switches between join, waiting, and ticket views.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "state": "join",
  "accent": "#FF4D1F",
  "questionType": "single",
  "verbalStatus": "waiting"
}/*EDITMODE-END*/;

const EXAM_INFO = {
  subject: 'Теория вероятностей и статистика',
  code: 'MATH-301',
  date: '24 мая, 14:00',
  duration: 90,
  tickets: 30,
  teacher: 'Д-р Елена Новик',
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [student, setStudent] = React.useState(null); // { name, group, studentId }

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-soft', tweaks.accent + '20');
  }, [tweaks.accent]);

  function handleJoin(data) {
    setStudent(data);
    setTweak('state', 'waiting');
  }
  function startExam() { setTweak('state', 'taking'); }
  function exitExam()  { setTweak('state', 'waiting'); }

  return (
    <>
      <div className="stage" data-screen-label={
        tweaks.state === 'join'    ? '01 Вход'    :
        tweaks.state === 'waiting' ? '02 Ожидание' :
        '03 Билет'
      }>
        <div className="frame">
          {tweaks.state === 'join' && (
            <Join examInfo={EXAM_INFO} onJoin={handleJoin} />
          )}
          {tweaks.state === 'waiting' && (
            <Waiting
              examInfo={EXAM_INFO}
              student={student}
              onStart={startExam}
              started={false}
            />
          )}
          {tweaks.state === 'taking' && (
            <Ticket
              subject={{ name: EXAM_INFO.subject, code: EXAM_INFO.code }}
              student={student}
              ticketNumber={7}
              questionType={tweaks.questionType}
              verbalStatus={tweaks.verbalStatus}
              onExit={exitExam}
            />
          )}
        </div>
      </div>

      <TweaksPanel title="Настройки">
        <TweakSection label="Состояние" />
        <TweakRadio
          label="Экран"
          value={tweaks.state}
          options={[
            { value: 'join',    label: 'Вход' },
            { value: 'waiting', label: 'Ожидание' },
            { value: 'taking',  label: 'Билет' },
          ]}
          onChange={(v) => setTweak('state', v)}
        />
        <TweakButton
          label="▶  Запустить «Преподаватель начал»"
          onClick={() => setTweak('state', 'taking')}
        />
        <TweakButton
          label="↺  Сбросить — на экран входа"
          onClick={() => { setStudent(null); setTweak('state', 'join'); }}
        />

        {tweaks.state === 'taking' && (
          <>
            <TweakSection label="Тип вопроса" />
            <TweakRadio
              label="Вопрос"
              value={tweaks.questionType}
              options={[
                { value: 'single', label: 'Тестовый' },
                { value: 'verbal', label: 'Устный' },
              ]}
              onChange={(v) => setTweak('questionType', v)}
            />
            {tweaks.questionType === 'verbal' && (
              <TweakRadio
                label="Статус ответа"
                value={tweaks.verbalStatus}
                options={[
                  { value: 'waiting',   label: 'Ожид.' },
                  { value: 'recording', label: 'Идёт' },
                  { value: 'finished',  label: 'Дальше' },
                ]}
                onChange={(v) => setTweak('verbalStatus', v)}
              />
            )}
          </>
        )}
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
