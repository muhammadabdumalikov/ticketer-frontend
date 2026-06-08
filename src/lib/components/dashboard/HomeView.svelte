<script lang="ts">
	import { goto } from '$app/navigation';
	import { _, locale } from 'svelte-i18n';
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
		const month = dt
			? new Intl.DateTimeFormat($locale ?? 'ru', { month: 'short' }).format(dt)
			: $_('home.monthTbd');

		let statusLabel = $_('home.statusPlanned');
		let statusKind: ScheduleRow['statusKind'] = '';
		if (s.status === 'live') {
			const hhmm = s.startedAt
				? new Intl.DateTimeFormat($locale ?? 'ru', { hour: '2-digit', minute: '2-digit' }).format(
						new Date(s.startedAt)
					)
				: '';
			statusLabel = hhmm ? `LIVE ${hhmm}` : 'LIVE';
			statusKind = 'orange';
		} else if (!s.scheduledAt) {
			statusLabel = $_('home.statusDraft');
		}

		return {
			id: s.id,
			day,
			month,
			title: `${s.ticketTitle} — ${s.subjectName}`,
			sub: `${s.subjectCode} · ${$_('units.students', { values: { n: s.memberCount } })}`,
			dur: `${s.durationMin} ${$_('units.min')}`,
			q: $_('units.questions', { values: { n: s.questionCount } }),
			statusLabel,
			statusKind
		};
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
		<h1>{$_('home.greeting')} <em>{$_('home.greetingPrompt')}</em></h1>
		<div class="sub">{$_('home.semesterSubtitle')}</div>
	</div>
	<button class="btn btn-primary btn-lg" onclick={onCreate}>
		<Icon name="plus" /> {$_('home.createExam')}
	</button>
</div>

<div class="stats">
	<div class="stat">
		<div class="k">{$_('home.statActiveSubjects')}</div>
		<div class="v">{activeSubjects}</div>
		<div class="delta"><Icon name="up" /> {$_('home.statTotal', { values: { count: subjects.length } })}</div>
	</div>
	<div class="stat">
		<div class="k">{$_('home.statTicketsInBank')}</div>
		<div class="v">{totalTickets}</div>
		<div class="delta"><Icon name="up" /> {$_('home.statBySubjects', { values: { count: subjects.length } })}</div>
	</div>
	<div class="stat">
		<div class="k">{$_('home.statSessionsPerWeek')}</div>
		<div class="v">—</div>
		<div class="delta">{$_('common.soon')}</div>
	</div>
	<div class="stat">
		<div class="k">{$_('home.statAvgScore')}</div>
		<div class="v">—<small>/100</small></div>
		<div class="delta">{$_('common.soon')}</div>
	</div>
</div>

<div class="sect-head">
	<div>
		<h2>{$_('home.yourSubjects')}</h2>
		<div class="meta">{$_('home.yourSubjectsHint')}</div>
	</div>
	<div class="actions">
		<button class="btn btn-outline btn-sm"><Icon name="filter" /> {$_('common.filter')}</button>
		<button class="btn btn-outline btn-sm" onclick={onAddSubject}><Icon name="plus" /> {$_('home.subjectButton')}</button>
	</div>
</div>
<div class="subjects">
	{#each subjects as s (s.id)}
		<SubjectCard subj={s} onOpen={onOpenSubject} />
	{/each}
</div>

<div class="sect-head">
	<div>
		<h2>{$_('home.upcomingSessions')}</h2>
		<div class="meta">
			{#if rows.length > 0}
				{$_('home.upcomingHint')}
			{:else}
				{$_('home.upcomingEmptyHint')}
			{/if}
		</div>
	</div>
	{#if rows.length > 0}
		<div class="actions">
			<button class="btn btn-outline btn-sm">{$_('common.showAll')}</button>
		</div>
	{/if}
</div>

{#if rows.length > 0}
	<div class="surface" style="padding: 14px 18px;">
		<div class="schedule">
			<div class="sch-row head">
				<span>{$_('home.colDate')}</span>
				<span>{$_('home.colExam')}</span>
				<span>{$_('home.colDuration')}</span>
				<span>{$_('home.colQuestions')}</span>
				<span>{$_('home.colStatus')}</span>
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
							<Icon name="play" /> {$_('common.open')}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="surface schedule-empty">
		<div class="schedule-empty-ic"><Icon name="calendar" size={28} /></div>
		<h3>{$_('home.emptyTitle')}</h3>
		<p>{$_('home.emptyDesc')}</p>
		<button class="btn btn-primary" onclick={onCreate}>
			<Icon name="plus" /> {$_('home.createExam')}
		</button>
	</div>
{/if}
