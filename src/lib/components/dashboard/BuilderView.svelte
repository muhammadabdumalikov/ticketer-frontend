<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import QuestionCard, { type BuilderQuestion } from './QuestionCard.svelte';
	import type { Subject } from '$lib/api/subjects';
	import type { ApiQuestion } from '$lib/api/tickets';
	import { examsApi, type ApiExamDetail, type ExamTicketInput } from '$lib/api/exams';

	interface Props {
		subjects: Subject[];
		subject: Subject | null;
		startStep?: number;
		editingExamId?: string | null;
		onBack: () => void;
		onAddSubject: () => void;
		onPublished?: () => void;
		returnLabel?: string;
	}
	let {
		subjects,
		subject: initialSubject,
		startStep = 0,
		editingExamId = null,
		onBack,
		onAddSubject,
		onPublished,
		returnLabel = 'Назад'
	}: Props = $props();

	const MAX_QUESTIONS_PER_TICKET = 3;

	interface TicketDraft {
		uid: string;
		title: string;
		questions: BuilderQuestion[];
		collapsed: boolean;
	}

	function uid(prefix: string) {
		return prefix + '_' + Math.random().toString(36).slice(2, 8);
	}

	function makeQuestion(): BuilderQuestion {
		return {
			id: uid('q'),
			text: '',
			type: 'single',
			points: 5,
			time: 60,
			difficulty: 'medium',
			correct: 0,
			answers: ['', '', ''],
			rubric: ''
		};
	}

	function makeTicket(position: number): TicketDraft {
		return {
			uid: uid('tk'),
			title: `Билет №${position}`,
			questions: [makeQuestion()],
			collapsed: false
		};
	}

	function fromApiQuestion(q: ApiQuestion): BuilderQuestion {
		return {
			id: q.id,
			text: q.text ?? '',
			type: q.type,
			points: q.points,
			time: q.time,
			difficulty: q.difficulty,
			correct: Array.isArray(q.correct)
				? (q.correct as unknown as number)
				: (typeof q.correct === 'number' ? q.correct : 0),
			answers: q.answers && q.answers.length > 0 ? q.answers : ['', '', ''],
			rubric: q.rubric ?? ''
		};
	}

	const isEditing = $derived(editingExamId !== null);
	const steps = $derived(
		isEditing ? (['Параметры', 'Билеты'] as const) : (['Экзамен', 'Параметры', 'Билеты'] as const)
	);

	let step = $state(untrack(() => (editingExamId ? 0 : startStep)));
	let subject = $state<Subject | null>(untrack(() => initialSubject));
	let details = $state({
		title: '',
		description: '',
		duration: 90,
		attempts: 1,
		visibility: 'private',
		shuffle: 'fixed'
	});
	let tickets = $state<TicketDraft[]>([makeTicket(1)]);
	let published = $state<null | {
		title: string;
		subject: Subject;
		totalPoints: number;
		ticketCount: number;
		questionCount: number;
		duration: number;
		mode: 'create' | 'update';
	}>(null);
	let createdCount = $state(0);
	let publishing = $state(false);
	let publishError = $state('');
	let loadingEdit = $state(false);
	let loadEditError = $state('');
	let editingStatus = $state<string>('Черновик');

	$effect(() => {
		if (initialSubject) subject = initialSubject;
	});

	$effect(() => {
		if (!editingExamId) return;
		const id = editingExamId;
		loadingEdit = true;
		loadEditError = '';
		examsApi
			.get(id)
			.then((e: ApiExamDetail) => {
				details = {
					title: e.title,
					description: e.description ?? '',
					duration: e.durationMin,
					attempts: e.attempts,
					visibility: e.visibility,
					shuffle: e.shuffleMode
				};
				tickets = e.tickets.length
					? e.tickets.map((t, i) => ({
							uid: uid('tk'),
							title: t.title || `Билет №${i + 1}`,
							questions: t.questions.length
								? t.questions.map(fromApiQuestion)
								: [makeQuestion()],
							// Start collapsed when there are multiple tickets so the page
							// isn't a wall of question cards on open. The first ticket
							// stays expanded as a focus hint.
							collapsed: i > 0
						}))
					: [makeTicket(1)];
				editingStatus = e.status;
				const found = subjects.find((s) => s.id === e.subjectId);
				if (found) subject = found;
			})
			.catch((err) => {
				loadEditError = (err as Error).message;
			})
			.finally(() => {
				loadingEdit = false;
			});
	});

	let currentStepLabel = $derived(steps[step]);
	let totalQuestions = $derived(tickets.reduce((a, t) => a + t.questions.length, 0));
	let totalPoints = $derived(
		tickets.reduce((a, t) => a + t.questions.reduce((p, q) => p + (q.points || 0), 0), 0)
	);
	let totalTimeMin = $derived(
		Math.round(
			tickets.reduce((a, t) => a + t.questions.reduce((p, q) => p + (q.time || 0), 0), 0) / 60
		)
	);

	let canNext = $derived(
		(currentStepLabel === 'Экзамен' && subject) ||
		(currentStepLabel === 'Параметры' && details.title.trim().length >= 2) ||
		(currentStepLabel === 'Билеты' &&
			tickets.length > 0 &&
			tickets.every((t) => t.questions.length > 0 && t.questions[0].text.trim().length > 0))
	);

	function next() {
		if (!canNext || publishing) return;
		if (step < steps.length - 1) step += 1;
		else void publish();
	}

	function buildQuestionPayload(q: BuilderQuestion) {
		return {
			type: q.type,
			text: q.text,
			points: q.points,
			time: q.time,
			difficulty: q.difficulty,
			...(q.type === 'single' ? { answers: q.answers, correct: q.correct } : {}),
			...(q.type === 'multi'
				? { answers: q.answers, correct: Array.isArray(q.correct) ? q.correct : [] }
				: {}),
			...(q.type === 'verbal' ? { rubric: q.rubric ?? '' } : {})
		};
	}

	function ticketsPayload(): ExamTicketInput[] {
		return tickets.map((t) => ({
			title: t.title.trim() || undefined,
			questions: t.questions.map(buildQuestionPayload)
		}));
	}

	async function publish() {
		if (!subject) return;
		publishing = true;
		publishError = '';
		try {
			const detailsPayload = {
				title: details.title.trim(),
				description: details.description,
				duration: details.duration,
				attempts: details.attempts,
				visibility: details.visibility as 'private' | 'department' | 'public',
				shuffle: details.shuffle as 'fixed' | 'shuffle' | 'random-bank'
			};
			if (editingExamId) {
				await examsApi.update(editingExamId, {
					details: detailsPayload,
					tickets: ticketsPayload()
				});
			} else {
				await examsApi.create({
					subjectId: subject.id,
					details: detailsPayload,
					tickets: ticketsPayload()
				});
			}
			published = {
				title: details.title.trim(),
				subject,
				totalPoints,
				ticketCount: tickets.length,
				questionCount: totalQuestions,
				duration: details.duration,
				mode: editingExamId ? 'update' : 'create'
			};
			createdCount += 1;
			onPublished?.();
		} catch (err) {
			publishError = (err as Error).message;
		} finally {
			publishing = false;
		}
	}

	function startAnother() {
		details = {
			title: '',
			description: '',
			duration: 90,
			attempts: 1,
			visibility: 'private',
			shuffle: 'fixed'
		};
		tickets = [makeTicket(1)];
		published = null;
		step = 1;
	}

	// Ticket-level operations
	function addTicket() {
		tickets = [...tickets, makeTicket(tickets.length + 1)];
	}
	function removeTicket(tkIdx: number) {
		if (tickets.length === 1) return;
		tickets = tickets.filter((_, i) => i !== tkIdx).map((t, i) => ({
			...t,
			// Re-label "Билет №N" entries to keep the sequence tidy if the user
			// hasn't customised the title.
			title: /^Билет №\d+$/.test(t.title) ? `Билет №${i + 1}` : t.title
		}));
	}
	function setTicketTitle(tkIdx: number, value: string) {
		const next = tickets.slice();
		next[tkIdx] = { ...next[tkIdx], title: value };
		tickets = next;
	}
	function toggleTicketCollapsed(tkIdx: number) {
		const next = tickets.slice();
		next[tkIdx] = { ...next[tkIdx], collapsed: !next[tkIdx].collapsed };
		tickets = next;
	}

	// Question-level operations (within a ticket)
	function updateQ(tkIdx: number, qIdx: number, q: BuilderQuestion) {
		const ticket = tickets[tkIdx];
		const nextQ = ticket.questions.slice();
		nextQ[qIdx] = q;
		const next = tickets.slice();
		next[tkIdx] = { ...ticket, questions: nextQ };
		tickets = next;
	}
	function removeQ(tkIdx: number, qIdx: number) {
		const ticket = tickets[tkIdx];
		if (ticket.questions.length === 1) return;
		const next = tickets.slice();
		next[tkIdx] = { ...ticket, questions: ticket.questions.filter((_, j) => j !== qIdx) };
		tickets = next;
	}
	function duplicateQ(tkIdx: number, qIdx: number) {
		const ticket = tickets[tkIdx];
		if (ticket.questions.length >= MAX_QUESTIONS_PER_TICKET) return;
		const dup = {
			...ticket.questions[qIdx],
			id: uid('q'),
			answers: ticket.questions[qIdx].answers.slice()
		};
		const nextQ = ticket.questions.slice();
		nextQ.splice(qIdx + 1, 0, dup);
		const next = tickets.slice();
		next[tkIdx] = { ...ticket, questions: nextQ };
		tickets = next;
	}
	function moveQ(tkIdx: number, qIdx: number, dir: number) {
		const ticket = tickets[tkIdx];
		const j = qIdx + dir;
		if (j < 0 || j >= ticket.questions.length) return;
		const nextQ = ticket.questions.slice();
		[nextQ[qIdx], nextQ[j]] = [nextQ[j], nextQ[qIdx]];
		const next = tickets.slice();
		next[tkIdx] = { ...ticket, questions: nextQ };
		tickets = next;
	}
	function addQuestion(tkIdx: number) {
		const ticket = tickets[tkIdx];
		if (ticket.questions.length >= MAX_QUESTIONS_PER_TICKET) return;
		const next = tickets.slice();
		next[tkIdx] = { ...ticket, questions: [...ticket.questions, makeQuestion()] };
		tickets = next;
	}

	function jumpTo(i: number) {
		if (i <= step) step = i;
	}

	const visibilityOpts = [
		{ value: 'private', label: 'Только записанные студенты', hint: 'Доступно по списку группы' },
		{ value: 'department', label: 'Кафедра', hint: 'Все преподаватели кафедры видят билет' },
		{ value: 'public', label: 'Публичная ссылка', hint: 'Любой, у кого есть ссылка' }
	];
	const shuffleOpts = [
		{ value: 'fixed', label: 'Фиксированный', hint: 'В том же порядке, что вы ввели' },
		{ value: 'shuffle', label: 'Перемешать', hint: 'Каждый студент — своя последовательность' },
		{ value: 'random-bank', label: 'Случайно из банка', hint: 'Брать по тагам из банка вопросов' }
	];
</script>

{#if published}
	<div class="done-screen">
		<div class="done-card">
			<div class="done-icon"><Icon name="check" size={30} stroke={2.5} /></div>
			<div class="done-eyebrow">
				{published.mode === 'update' ? 'ЭКЗАМЕН ОБНОВЛЁН' : 'ЭКЗАМЕН ОПУБЛИКОВАН'}
			</div>
			<h2>«{published.title}»</h2>
			<p>
				Экзамен для <b>{published.subject.code} — {published.subject.name}</b>
				{published.mode === 'update' ? 'обновлён.' : 'сохранён и доступен записанным студентам.'}
			</p>

			<div class="done-stats">
				<div>
					<div class="k">Билетов</div>
					<div class="v">{published.ticketCount}</div>
				</div>
				<div>
					<div class="k">Вопросов</div>
					<div class="v">{published.questionCount}</div>
				</div>
				<div>
					<div class="k">Баллов</div>
					<div class="v">{published.totalPoints}</div>
				</div>
				<div>
					<div class="k">Длительность</div>
					<div class="v">{published.duration}<small> мин</small></div>
				</div>
			</div>

			<div class="done-actions">
				{#if published.mode === 'create'}
					<button class="btn btn-primary btn-lg" onclick={startAnother} style="background: var(--accent);">
						<Icon name="plus" /> Создать ещё экзамен для {published.subject.code}
					</button>
					<button class="btn btn-outline btn-lg" onclick={onBack}>
						Готово — {returnLabel} <Icon name="arrow" />
					</button>
				{:else}
					<button class="btn btn-primary btn-lg" onclick={onBack}>
						Готово — {returnLabel} <Icon name="arrow" />
					</button>
				{/if}
			</div>

			{#if published.mode === 'create'}
				<div class="done-foot">
					<span class="label-mono">или</span>
					<button class="link-btn" onclick={() => { published = null; step = steps.length - 1; }}>
						продолжить редактировать этот экзамен
					</button>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="wiz-top">
		<button class="btn btn-ghost btn-sm" onclick={onBack}><Icon name="back" /> {returnLabel}</button>
		<div class="stepper">
			{#each steps as s, i (i)}
				{@const state = i < step ? 'done' : i === step ? 'current' : 'todo'}
				<button
					type="button"
					class="step {state}"
					onclick={() => jumpTo(i)}
					disabled={i > step}
				>
					<span class="step-num">
						{#if state === 'done'}<Icon name="check" />{:else}{String(i + 1).padStart(2, '0')}{/if}
					</span>
					<span class="step-text">
						<span class="step-eyebrow">Шаг {i + 1}</span>
						<span class="step-label">{s}</span>
					</span>
				</button>
				{#if i < steps.length - 1}<span class="step-sep {i < step ? 'done' : ''}"></span>{/if}
			{/each}
		</div>
		<div style="display: flex; gap: 8px;">
			{#if isEditing}
				<span class="pill {editingStatus === 'Опубликован' ? 'green' : editingStatus === 'Запланирован' ? 'orange' : ''}">
					{editingStatus.toUpperCase()}
				</span>
			{:else}
				<span class="pill orange">ЧЕРНОВИК</span>
			{/if}
		</div>
	</div>

	{#if isEditing && loadingEdit}
		<div class="wiz-card" style="text-align: center; padding: 48px;">
			<div style="color: var(--muted); font-size: 14px;">Загружаем экзамен…</div>
		</div>
	{:else if isEditing && loadEditError}
		<div class="wiz-card" style="text-align: center; padding: 48px;">
			<h3 style="margin: 0 0 8px;">Не удалось загрузить экзамен</h3>
			<p style="color: var(--muted); margin: 0 0 16px;">{loadEditError}</p>
			<button class="btn btn-outline" onclick={onBack}>Назад</button>
		</div>
	{:else if currentStepLabel === 'Экзамен'}
		<div class="wiz-card">
			<div class="wiz-head">
				<h2>Для какого предмета новый экзамен?</h2>
				<p>Выберите предмет из вашего списка или добавьте новый.</p>
			</div>

			<div class="subj-picker">
				{#each subjects as s (s.id)}
					<button
						type="button"
						class="subj-tile {subject?.id === s.id ? 'on' : ''}"
						onclick={() => (subject = s)}
						style={subject?.id === s.id ? `border-color: ${s.color}; box-shadow: 0 0 0 3px ${s.color}20;` : ''}
					>
						<div class="subj-tile-sigil" style="background: {s.color}18; color: {s.color}">
							{s.sigil}
						</div>
						<div style="min-width: 0; flex: 1;">
							<div class="subj-tile-name">{s.name}</div>
							<div class="subj-tile-code">{s.code} · {s.tickets} билетов · {s.students} студентов</div>
						</div>
						{#if subject?.id === s.id}
							<div class="subj-tile-check" style="background: {s.color}"><Icon name="check" /></div>
						{/if}
					</button>
				{/each}

				<button type="button" class="subj-tile add" onclick={onAddSubject}>
					<div class="subj-tile-sigil add"><Icon name="plus" /></div>
					<div style="min-width: 0; flex: 1;">
						<div class="subj-tile-name">Добавить новый предмет</div>
						<div class="subj-tile-code">Создайте новый предмет и сразу начните экзамен</div>
					</div>
				</button>
			</div>
		</div>
	{/if}

	{#if currentStepLabel === 'Параметры' && subject && !loadingEdit && !loadEditError}
		<div class="wiz-card">
			<div class="wiz-head">
				<h2>Параметры экзамена</h2>
				<p>Предмет: <b style="color: var(--ink);">{subject.code} — {subject.name}</b></p>
			</div>

			<div class="d-grid">
				<div class="m-field" style="grid-column: 1 / -1;">
					<label for="exam-title">Название экзамена</label>
					<input
						id="exam-title"
						bind:value={details.title}
						placeholder="напр. Весенний итоговый экзамен"
					/>
				</div>

				<div class="m-field" style="grid-column: 1 / -1;">
					<label for="exam-desc">Описание для студентов <span class="m-hint">(не обязательно)</span></label>
					<textarea
						id="exam-desc"
						bind:value={details.description}
						placeholder="Краткое описание, инструкции, разрешённые материалы…"
						rows={3}
					></textarea>
				</div>

				<div class="m-field">
					<label for="exam-duration">Общая длительность</label>
					<div class="input-with-unit">
						<input
							id="exam-duration"
							type="number" min="5" max="240"
							bind:value={details.duration}
						/>
						<span class="unit">мин</span>
					</div>
				</div>

				<div class="m-field">
					<label for="exam-attempts">Попыток</label>
					<input
						id="exam-attempts"
						type="number" min="1" max="10"
						bind:value={details.attempts}
					/>
				</div>

				<div class="m-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Доступ</label>
					<Dropdown
						value={details.visibility}
						onChange={(v) => (details.visibility = v)}
						variant="solid"
						options={visibilityOpts}
					>
						{#snippet icon()}<Icon name="eye" />{/snippet}
					</Dropdown>
				</div>

				<div class="m-field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label>Порядок вопросов</label>
					<Dropdown
						value={details.shuffle}
						onChange={(v) => (details.shuffle = v)}
						variant="solid"
						options={shuffleOpts}
					>
						{#snippet icon()}<Icon name="list" />{/snippet}
					</Dropdown>
				</div>
			</div>
		</div>
	{/if}

	{#if currentStepLabel === 'Билеты' && subject && !loadingEdit && !loadEditError}
		<div class="wiz-card" style="padding-bottom: 18px;">
			<div class="wiz-head" style="display: flex; justify-content: space-between; align-items: end; gap: 16px;">
				<div>
					<h2>{details.title || 'Экзамен без названия'}</h2>
					<p>{subject.code} — {subject.name} · {details.duration} мин · {tickets.length} бил. · {totalQuestions} вопр.</p>
				</div>
				<button type="button" class="btn btn-outline btn-sm"><Icon name="eye" /> Предпросмотр</button>
			</div>
		</div>

		{#each tickets as ticket, tkIdx (ticket.uid)}
			<div class="ticket-block {ticket.collapsed ? 'collapsed' : ''}">
				<div class="ticket-block-head">
					<button
						type="button"
						class="ticket-toggle"
						onclick={() => toggleTicketCollapsed(tkIdx)}
						aria-expanded={!ticket.collapsed}
						aria-label={ticket.collapsed ? 'Развернуть билет' : 'Свернуть билет'}
					>
						<span class="ticket-toggle-chev {ticket.collapsed ? '' : 'open'}">
							<Icon name="chev" />
						</span>
					</button>
					<input
						class="ticket-title-input"
						value={ticket.title}
						oninput={(e) => setTicketTitle(tkIdx, e.currentTarget.value)}
						placeholder={`Билет №${tkIdx + 1}`}
					/>
					<span class="ticket-block-count">{ticket.questions.length} / {MAX_QUESTIONS_PER_TICKET} вопр.</span>
					{#if tickets.length > 1}
						<button
							type="button"
							class="btn btn-ghost btn-sm"
							onclick={() => removeTicket(tkIdx)}
							title="Удалить билет"
						>
							<Icon name="trash" /> Удалить билет
						</button>
					{/if}
				</div>

				{#if !ticket.collapsed}
					{#each ticket.questions as q, qIdx (q.id)}
						<QuestionCard
							{q}
							index={qIdx}
							onChange={(nq) => updateQ(tkIdx, qIdx, nq)}
							onRemove={() => removeQ(tkIdx, qIdx)}
							onDuplicate={() => duplicateQ(tkIdx, qIdx)}
							onMove={(i, dir) => moveQ(tkIdx, i, dir)}
						/>
					{/each}

					{#if ticket.questions.length < MAX_QUESTIONS_PER_TICKET}
						<button
							type="button"
							class="add-question"
							onclick={() => addQuestion(tkIdx)}
						>
							<Icon name="plus" /> Добавить вопрос
						</button>
					{/if}
				{/if}
			</div>
		{/each}

		<button type="button" class="add-ticket" onclick={addTicket}>
			<Icon name="plus" /> Добавить билет
		</button>
	{/if}

	<div class="save-bar">
		<div class="info">
			<div class="it">
				<span class="k">Шаг</span>
				<span class="v">{step + 1} / {steps.length}</span>
			</div>
			{#if subject}
				<div class="it">
					<span class="k">Предмет</span>
					<span class="v">{subject.code}</span>
				</div>
			{/if}
			{#if currentStepLabel !== 'Экзамен'}
				<div class="it">
					<span class="k">Длительность</span>
					<span class="v">{details.duration} мин</span>
				</div>
			{/if}
			{#if currentStepLabel === 'Билеты'}
				<div class="it">
					<span class="k">Билетов</span>
					<span class="v">{tickets.length}</span>
				</div>
				<div class="it">
					<span class="k">Вопросов</span>
					<span class="v">{totalQuestions}</span>
				</div>
				<div class="it">
					<span class="k">Баллов</span>
					<span class="v">{totalPoints}</span>
				</div>
				<div class="it">
					<span class="k">Таймеры</span>
					<span class="v">{totalTimeMin} мин</span>
				</div>
			{/if}
		</div>
		<div class="spacer"></div>

		{#if step > 0}
			<button
				class="btn btn-sm"
				style="background: rgba(255,255,255,.08); color: #fff;"
				onclick={() => (step -= 1)}
			>
				<Icon name="back" /> Назад
			</button>
		{/if}
		<button
			class="btn"
			style="background: {canNext ? 'var(--accent)' : 'rgba(255,255,255,.15)'}; color: #fff; opacity: {canNext && !publishing ? 1 : 0.5}; cursor: {canNext && !publishing ? 'pointer' : 'not-allowed'};"
			onclick={next}
			disabled={!canNext || publishing}
		>
			{#if step < steps.length - 1}
				Далее <Icon name="arrow" />
			{:else if publishing}
				{isEditing ? 'Сохраняем…' : 'Публикуем…'}
			{:else}
				{isEditing ? 'Сохранить изменения' : 'Опубликовать экзамен'} <Icon name="arrow" />
			{/if}
		</button>
	</div>
	{#if publishError}
		<div style="background: var(--accent-soft); color: var(--accent); padding: 12px 16px; border-radius: 12px; margin-top: 8px;">
			{isEditing ? 'Не удалось сохранить' : 'Не удалось опубликовать'}: {publishError}
		</div>
	{/if}
{/if}
