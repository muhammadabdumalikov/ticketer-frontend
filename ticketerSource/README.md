# Ticketer — University Exam Tickets Platform

A platform for university teachers to create exam tickets and run live exam sessions, and for students to take those exams in synchronized rooms. UI is in Russian; this document is in English to help with implementation.

This repo is a **design + interactive prototype** in plain HTML/React (via Babel standalone). Use it as the single source of truth for layout, copy, and flow when building the real backend-backed product.

---

## 1. Roles

| Role | What they do |
|------|-------------|
| **Teacher** (`преподаватель`) | Creates subjects, builds exam tickets (questions + answers + points + time), launches live exam sessions, proctors verbal answers, grades. |
| **Department admin** (`администратор кафедры`) | Same shape as teacher but scoped to a faculty/department (signals only — UI present at login). |
| **Student** (`студент`) | Opens an exam URL, enters name + group, joins the waiting room, gets a randomly assigned ticket when the teacher starts the session, answers it. |

---

## 2. Pages / Screens

| File | Audience | Purpose |
|------|---------|---------|
| `Login.html` | Teacher / Admin | Sign in (email + password, optional SSO, role tabs). Three layouts via tweaks: split, center, exam-preview. |
| `Dashboard.html` | Teacher | Main workspace: home, subjects list, single subject view, tickets directory, exam builder wizard. |
| `Student.html` | Student | Three sequential states: **Join** → **Waiting** → **Taking**. Switches automatically as the session progresses. |
| `TeacherProctor.html` | Teacher (during session) | The proctoring console used when a student is giving a **verbal** answer. Big center timer + start/stop + star rating. |

---

## 3. Core flows

### 3.1 Teacher: creating an exam ticket

```
Login → Dashboard (home)
  ↓
Either:
  • Click a subject card           → Subject view → "Новый экзамен"
  • Click "Создать экзамен"        → Builder (Step 1: choose subject)
  • Click "Билеты" sidebar         → Tickets list → "Создать билет"
  ↓
Builder wizard (3 steps):
  1. Subject  — pick from list, or "Добавить новый предмет" (opens modal)
  2. Details  — title, description, total duration, attempts, visibility, question order
  3. Questions — add one or more questions; for each: text, type, points, time, answers (or rubric)
  ↓
Click "Опубликовать билет"
  ↓
Completion screen (one of):
  • "Создать ещё билет для {SUBJECT_CODE}"  → reset details + questions, stay on subject, Step 2
  • "Готово — К {wherever the user came from}" → back to source view
  • "продолжить редактировать этот билет" → back to Step 3 of same ticket
```

The "where the user came from" is tracked so **Готово** routes correctly to Home / Subjects / Tickets / Subject — and the sidebar highlight follows.

### 3.2 Question types

Set per-question on the builder card:

| Type | Storage | Student UI | Grading |
|------|---------|-----------|---------|
| `single`  | options[], correct: index | Radio list, pick one | Auto |
| `multi`   | options[], correct: index[] | Checkboxes | Auto |
| `text`    | expected: string | Text input | Auto (string match) or manual |
| `numeric` | expected: number, tolerance | Numeric input | Auto |
| `verbal`  | rubric: text, points: max | Mic card + status indicator | **Manual via proctor** |

For `verbal`, `time` is interpreted as a **soft cap in seconds** displayed as minutes ("до N мин"), not a hard countdown. The teacher manually starts/stops the actual answer timer in `TeacherProctor.html`.

### 3.3 Student: joining and taking the exam

```
Student opens exam URL
  ↓
Join screen (Student.html, state: 'join')
  – Enters Фамилия и имя, Группа, № зачётки (optional)
  – Confirms "готов сдавать самостоятельно"
  – Click "Войти в комнату"
  ↓
Waiting room (state: 'waiting')
  – Sees own row highlighted with "ВЫ" tag
  – Sees other students with online/offline status
  – Reads exam meta (subject, code, date, duration, ticketsCount, teacher)
  – Just waits. No interaction.
  ↓
Teacher clicks "Начать" on their side
Server picks a random ticket per student (1:1 if students == tickets,
otherwise allow duplicates per the teacher's session policy)
  ↓
Ticket view (state: 'taking')
  – Top bar: subject + per-question countdown timer + utility tools + exit
  – Left: passage / question text
  – Right: either MCQ options or verbal-answer card
  – Footer: pager "Вопрос N из M" + Назад / Далее
```

### 3.4 Verbal answer flow (teacher & student in sync)

```
Student's right pane (verbal):
  status = 'waiting'    →  "Приготовьтесь"; teacher pill on top says "Ожидание"
       student starts speaking, teacher sees and clicks "Старт"
  status = 'recording'  →  big mic pulses, top pill = elapsed time, red dot
       student finishes, teacher clicks "Стоп"
  status = 'finished'   →  green check, "Преподаватель оценивает…"

Teacher console (TeacherProctor.html):
  state = 'idle'      →  show "Старт — студент начал" button
  state = 'recording' →  timer counts up, button = "Стоп — ответ завершён"
  state = 'finished'  →  timer freezes; star rating + notes become primary
       teacher clicks N stars (1..maxPoints) + writes notes
       clicks "Сохранить оценку и далее"
       toast appears for 1.5s, then:
         – roster cursor moves to next student
         – timer/score/notes reset
         – student card updates
```

---

## 4. Data model (suggested)

```ts
type Subject = {
  id: string;            // ex 's1' or db uuid
  name: string;          // 'Теория вероятностей и статистика'
  code: string;          // 'MATH-301'
  sigil: string;         // 2-3 char short; 'ТВ'
  color: string;         // hex; used everywhere this subject appears
  status: 'active' | 'live' | 'draft';
  teacherId: string;
  studentsCount: number; // derived: enrollments
  ticketsCount: number;  // derived
  examsCount: number;    // derived
};

type Question = {
  id: string;
  type: 'single' | 'multi' | 'text' | 'numeric' | 'verbal';
  text: string;
  points: number;        // for verbal: max points
  time: number;          // seconds; for verbal: soft cap
  difficulty: 'easy' | 'medium' | 'hard';

  // MCQ-specific
  answers?: string[];
  correct?: number | number[];   // index for single; index[] for multi

  // text / numeric
  expected?: string | number;
  tolerance?: number;

  // verbal
  rubric?: string;       // teacher-only criteria
};

type ExamTicket = {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  duration: number;          // total minutes
  attempts: number;
  visibility: 'private' | 'department' | 'public';
  shuffle: 'fixed' | 'shuffle' | 'random-bank';
  questions: Question[];
  status: 'Черновик' | 'Опубликован' | 'Запланирован' | 'Архив';
  authorId: string;
  updatedAt: ISODateString;
};

type Session = {
  id: string;
  examId: string;            // -> ExamTicket
  scheduledAt: ISODateString;
  startedAt?: ISODateString;
  endedAt?: ISODateString;
  status: 'scheduled' | 'live' | 'finished';
  ticketsPolicy: 'one-per-student' | 'allow-duplicates';
};

type RoomMember = {
  sessionId: string;
  studentId: string;         // ad-hoc, created on join (no auth required)
  name: string;
  group: string;
  studentNumber?: string;
  joinedAt: ISODateString;
  online: boolean;
  assignedTicketId?: string; // set when session starts
};

type Answer = {
  sessionId: string;
  studentId: string;
  questionId: string;
  // one of:
  selectedIndex?: number;
  selectedIndices?: number[];
  textValue?: string;
  numericValue?: number;
  // verbal:
  startedAt?: ISODateString;
  endedAt?: ISODateString;
  durationSec?: number;
  notes?: string;
  // grading:
  pointsAwarded: number;
  gradedBy?: string;
  gradedAt?: ISODateString;
};
```

---

## 5. Real-time sync points (server work)

These are the moments where backend state must broadcast to connected clients (websocket / SSE / poll):

1. **`session:join`** — student joins → roster updated for everyone in the room (incl. teacher's `TeacherProctor.html`).
2. **`session:start`** — teacher starts → each student gets their `assignedTicketId` → student client transitions `waiting → taking`.
3. **`session:tick`** — per-second remaining time per question (or just clocks on clients with server-authoritative deadline).
4. **`verbal:status`** — teacher's start/stop on a verbal question → student's right-pane reflects `waiting | recording | finished`.
5. **`grade:save`** — teacher submits a verbal grade → student sees their score (and proctor's cursor advances to next student).
6. **`session:end`** — teacher ends → all clients freeze and show summary.

---

## 6. Visual system (use as-is)

| Token | Value |
|-------|-------|
| Font  | Geist + Geist Mono (Google Fonts) |
| Bg outer | `#ECECEC` |
| Bg panel | `#F6F6F6` |
| Bg card  | `#FFFFFF` |
| Ink      | `#0A0A0A` |
| Muted    | `#8A8A8A` |
| Accent   | `#FF4D1F` (orange-red) |
| Accent soft | `#FFEDE6` |
| Green (success / online) | `#1F9D55` |
| Radii: card 28 · panel 22 · field 14 · button 12 |

Buttons:
- `.btn-primary` — solid black on light, white text. Main actions.
- `.btn-outline` — white with 1px line. Secondary.
- `.btn-ghost` — gray fill. Tertiary.
- Accent (orange) reserved for: progress, "live" status, completion screen primary CTA.

No emoji. Sigils for subjects use 2 Cyrillic capitals on a tinted bg of the subject color (12% opacity).

---

## 7. File map

```
Login.html            ─ Auth entry
  login-app.jsx       ─ Login screen + Tweaks

Dashboard.html        ─ Teacher workspace (single-page, view-routed)
  dashboard-app.jsx   ─ Root; view switcher; modal state
  dashboard-shell.jsx ─ Sidebar + Topbar
  dashboard-icons.jsx ─ SVG icon set (DI.*)
  dashboard-views.jsx ─ HomeView, SubjectsListView, SubjectView, SubjectCard
  dashboard-tickets.jsx ─ TicketsView (flat tickets directory)
  dashboard-builder.jsx ─ 3-step exam builder wizard + QuestionCard
  dashboard-modals.jsx  ─ AddSubjectModal
  dashboard-dropdown.jsx ─ Custom <Dropdown> replacing native <select>

Student.html          ─ Student-side (single page, state-routed)
  student-main.jsx    ─ Root; view switcher (join → waiting → taking)
  student-icons.jsx   ─ Shared icon set
  student-join-view.jsx ─ Name/group entry form
  student-waiting.jsx ─ Pre-exam waiting room
  student-ticket-view.jsx ─ Ticket / question UI (MCQ + verbal)

TeacherProctor.html   ─ Live grading console for verbal answers
  proctor-app.jsx     ─ Roster + timer + rating

tweaks-panel.jsx      ─ Reusable in-prototype controls (delete in production)
```

In the production app you'd drop `tweaks-panel.jsx`, the inline Babel transform, and likely consolidate per-page files into proper React/TS modules.

---

## 8. Implementation notes / gotchas

- **Random ticket assignment** — the algorithm should be deterministic given the session seed and member list, so a reload returns the same ticket to the same student.
- **Reconnect on student side** — joining the same URL with the same name+group should rejoin the same `RoomMember` row, not create a duplicate.
- **Per-question timer** — keep server-authoritative deadlines; clients only render. Otherwise tab-throttling / clock drift will let students cheat.
- **Verbal proctor preview** in the builder — the rubric the teacher types in `dashboard-builder.jsx` is *teacher-only* — never echo it to the student client.
- **Session policy** — when `questionsCount >= studentsCount`, deal unique tickets. Otherwise let the teacher choose: allow duplicates, or shorten the queue.
- **Manual grading on verbal** — must happen *during* the session in the prototype's flow. In production you may want async grading later; design isn't blocking either.

---

## 9. Out of scope (for now)

These are mentioned in copy or sidebar but **not implemented**:

- `Сессии` — sessions calendar
- `Банк вопросов` — cross-exam question bank
- `Аналитика` — per-student / per-question analytics
- `Студенты` tab inside the subject view
- Notifications (`bell` icon is decorative)
- Multi-attempt logic on the student side
