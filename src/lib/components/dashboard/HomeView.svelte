<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import SubjectCard from './SubjectCard.svelte';
	import type { Subject } from '$lib/api/subjects';
	import type { ApiUpcomingSession } from '$lib/api/sessions';

	interface Props {
		subjects: Subject[];
		upcoming: ApiUpcomingSession[];
		onOpenSubject: (s: Subject) => void;
		onCreate: () => void;
		onAddSubject: () => void;
	}
	let { subjects, upcoming, onOpenSubject, onCreate, onAddSubject }: Props = $props();

	const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

	interface ScheduleRow {
		id: string;
		day: string;
		month: string;
		title: string;
		sub: string;
		dur: string;
		q: string;
		statusLabel: string;
		statusKind: '' | 'orange' | 'green';
	}

	function formatRow(s: ApiUpcomingSession): ScheduleRow {
		const when = s.startedAt ?? s.scheduledAt;
		const dt = when ? new Date(when) : null;
		const day = dt ? String(dt.getDate()) : '—';
		const month = dt ? MONTHS_RU[dt.getMonth()] : 'tbd';

		let statusLabel = 'ЗАПЛАНИРОВАН';
		let statusKind: ScheduleRow['statusKind'] = '';
		if (s.status === 'live') {
			const hhmm = s.startedAt
				? new Date(s.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
				: '';
			statusLabel = hhmm ? `LIVE ${hhmm}` : 'LIVE';
			statusKind = 'orange';
		} else if (!s.scheduledAt) {
			statusLabel = 'ЧЕРНОВИК';
		}

		const studentsWord = pluralStudents(s.memberCount);
		return {
			id: s.id,
			day,
			month,
			title: `${s.ticketTitle} — ${s.subjectName}`,
			sub: `${s.subjectCode} · ${s.memberCount} ${studentsWord}`,
			dur: `${s.durationMin} мин`,
			q: `${s.questionCount} ${pluralQuestions(s.questionCount)}`,
			statusLabel,
			statusKind
		};
	}

	function pluralStudents(n: number): string {
		const mod10 = n % 10;
		const mod100 = n % 100;
		if (mod10 === 1 && mod100 !== 11) return 'студент';
		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'студента';
		return 'студентов';
	}

	function pluralQuestions(n: number): string {
		const mod10 = n % 10;
		const mod100 = n % 100;
		if (mod10 === 1 && mod100 !== 11) return 'вопрос';
		if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'вопроса';
		return 'вопросов';
	}

	let rows = $derived(upcoming.map(formatRow));
	let activeSubjects = $derived(subjects.filter((s) => s.status !== 'draft').length);
	let totalTickets = $derived(subjects.reduce((acc, s) => acc + s.tickets, 0));

	function openSession(id: string) {
		void goto(`/sessions/${id}`);
	}
</script>

<div class="hello">
	<div>
		<h1>Добрый день. <em>Готов запустить следующий экзамен?</em></h1>
		<div class="sub">Весенний семестр · Все ваши предметы и билеты в одном месте.</div>
	</div>
	<button class="btn btn-primary btn-lg" onclick={onCreate}>
		<Icon name="plus" /> Создать экзамен
	</button>
</div>

<div class="stats">
	<div class="stat">
		<div class="k">Активных предметов</div>
		<div class="v">{activeSubjects}</div>
		<div class="delta"><Icon name="up" /> всего {subjects.length}</div>
	</div>
	<div class="stat">
		<div class="k">Билетов в банке</div>
		<div class="v">{totalTickets}</div>
		<div class="delta"><Icon name="up" /> по {subjects.length} предметам</div>
	</div>
	<div class="stat">
		<div class="k">Сессий за неделю</div>
		<div class="v">—</div>
		<div class="delta">скоро</div>
	</div>
	<div class="stat">
		<div class="k">Средний балл</div>
		<div class="v">—<small>/100</small></div>
		<div class="delta">скоро</div>
	</div>
</div>

<div class="sect-head">
	<div>
		<h2>Ваши предметы</h2>
		<div class="meta">Выберите предмет, чтобы посмотреть экзамены или создать новый билет.</div>
	</div>
	<div class="actions">
		<button class="btn btn-outline btn-sm"><Icon name="filter" /> Фильтр</button>
		<button class="btn btn-outline btn-sm" onclick={onAddSubject}><Icon name="plus" /> Предмет</button>
	</div>
</div>
<div class="subjects">
	{#each subjects as s (s.id)}
		<SubjectCard subj={s} onOpen={onOpenSubject} />
	{/each}
</div>

<div class="sect-head">
	<div>
		<h2>Предстоящие сессии</h2>
		<div class="meta">
			{#if rows.length > 0}
				Активные и запланированные экзамены — нажмите, чтобы открыть.
			{:else}
				Здесь появятся сессии, как только вы их создадите.
			{/if}
		</div>
	</div>
	{#if rows.length > 0}
		<div class="actions">
			<button class="btn btn-outline btn-sm">Показать все</button>
		</div>
	{/if}
</div>

{#if rows.length > 0}
	<div class="surface" style="padding: 14px 18px;">
		<div class="schedule">
			<div class="sch-row head">
				<span>Дата</span>
				<span>Экзамен</span>
				<span>Длительность</span>
				<span>Вопросы</span>
				<span>Статус</span>
				<span></span>
			</div>
			{#each rows as r (r.id)}
				<div class="sch-row">
					<div class="sch-date">
						<div class="d">{r.day}</div>
						<div class="m">{r.month}</div>
					</div>
					<div>
						<div class="sch-title">{r.title}</div>
						<div class="sch-sub">{r.sub}</div>
					</div>
					<div class="sch-cell">{r.dur}</div>
					<div class="sch-cell">{r.q}</div>
					<div><span class="pill {r.statusKind}">{r.statusLabel}</span></div>
					<div style="text-align: right;">
						<button class="btn btn-primary btn-sm" onclick={() => openSession(r.id)}>
							<Icon name="play" /> Открыть
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="surface schedule-empty">
		<div class="schedule-empty-ic"><Icon name="calendar" size={28} /></div>
		<h3>Пока нет предстоящих сессий</h3>
		<p>Создайте экзамен на основе билета — он появится здесь как только будет запланирован или запущен.</p>
		<button class="btn btn-primary" onclick={onCreate}>
			<Icon name="plus" /> Создать экзамен
		</button>
	</div>
{/if}
