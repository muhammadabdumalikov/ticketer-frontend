<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { get } from 'svelte/store';
	import type { Subject } from '$lib/api/subjects';
	import { examsApi, type ApiExamListItem } from '$lib/api/exams';
	import TicketActionsMenu from './TicketActionsMenu.svelte';
	import TicketDetailModal from './TicketDetailModal.svelte';
	import ShareExamModal from './ShareExamModal.svelte';

	interface Props {
		subject: Subject;
		onBack: () => void;
		onCreateExam: (s: Subject) => void;
		onEditExam: (e: ApiExamListItem) => void;
	}
	let { subject, onCreateExam, onEditExam }: Props = $props();

	let tab = $state<'exams' | 'bank' | 'sessions' | 'students'>('exams');
	let list = $state<ApiExamListItem[]>([]);
	let loadError = $state('');
	let launching = $state<string | null>(null);
	let viewingExamId = $state<string | null>(null);
	let sharingExam = $state<ApiExamListItem | null>(null);

	let tabs = $derived<Array<['exams' | 'bank' | 'sessions' | 'students', string]>>([
		['exams', $_('subjectView.tabs.exams')],
		['bank', $_('subjectView.tabs.bank')],
		['sessions', $_('subjectView.tabs.sessions')],
		['students', $_('subjectView.tabs.students')]
	]);

	async function refresh() {
		try {
			list = await examsApi.listForSubject(subject.id);
			loadError = '';
		} catch (err) {
			loadError = String(err);
		}
	}

	$effect(() => {
		void subject.id;
		void refresh();
	});

	function pillKind(status: string): string {
		if (status === 'Опубликован') return 'green';
		if (status === 'Запланирован') return 'orange';
		return '';
	}

	async function runExam(e: ApiExamListItem) {
		launching = e.id;
		try {
			const { sessionId } = await examsApi.launch(e.id);
			goto(`/sessions/${sessionId}`);
		} catch (err) {
			alert(get(_)('subjectView.launchError', { values: { error: (err as Error).message } }));
		} finally {
			launching = null;
		}
	}
</script>

<div class="sub-head">
	<div class="sigil-lg" style="background: {subject.color}">{subject.sigil}</div>
	<div>
		<h1>{subject.name}</h1>
		<div class="meta">
			<span><b>{subject.code}</b></span>
			<span>·</span>
			<span><b>{subject.students}</b> {$_('subjectView.meta.enrolled', { values: { n: subject.students } })}</span>
			<span>·</span>
			<span><b>{subject.tickets}</b> {$_('subjectView.meta.ticketsInBank', { values: { n: subject.tickets } })}</span>
			<span>·</span>
			<span><b>{subject.exams}</b> {$_('subjectView.meta.exams', { values: { n: subject.exams } })}</span>
		</div>
	</div>
	<div class="right">
		<button class="btn btn-outline"><Icon name="eye" /> {$_('common.preview')}</button>
		<button class="btn btn-primary" onclick={() => onCreateExam(subject)}>
			<Icon name="plus" /> {$_('subjectView.newExam')}
		</button>
	</div>
</div>

<div class="tabs2">
	{#each tabs as [id, label] (id)}
		<button class={tab === id ? 'active' : ''} onclick={() => (tab = id)}>{label}</button>
	{/each}
</div>

{#if tab === 'exams'}
	{#if loadError}
		<div class="empty">
			<h3>{$_('subjectView.loadError')}</h3>
			<p>{loadError}</p>
		</div>
	{:else}
		<div class="exam-list">
			{#each list as e, i (e.id)}
				<div
					class="exam-row"
					role="button"
					tabindex="0"
					onclick={() => (viewingExamId = e.id)}
					onkeydown={(ev) => ev.key === 'Enter' && (viewingExamId = e.id)}
				>
					<div class="num">{String(i + 1).padStart(2, '0')}</div>
					<div>
						<div class="title">{e.title}</div>
						<div class="sub">{$_('subjectView.row.updatedBy', { values: { date: e.updated, author: e.author } })}</div>
					</div>
					<div class="cell">
						<div class="k">{$_('subjectView.col.tickets')}</div>
						<div>{e.ticketCount} {$_('units.ticketsAbbr')}</div>
					</div>
					<div class="cell">
						<div class="k">{$_('subjectView.col.duration')}</div>
						<div>{e.durationMin} {$_('units.min')}</div>
					</div>
					<div>
						<span class="pill {pillKind(e.status)}">{$_('exams.statusPill.' + e.status).toUpperCase()}</span>
					</div>
					<div
						style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;"
						onclick={(ev) => ev.stopPropagation()}
						onkeydown={(ev) => ev.stopPropagation()}
						role="toolbar"
						tabindex="-1"
					>
						<button
							class="btn btn-primary btn-sm"
							disabled={launching === e.id}
							onclick={() => runExam(e)}
						>
							<Icon name="play" /> {launching === e.id ? $_('common.running') : $_('common.run')}
						</button>
						<button
							class="btn btn-outline btn-sm"
							onclick={() => (sharingExam = e)}
							title={$_('subjectView.shareLink')}
						>
							<Icon name="share" /> {$_('common.share')}
						</button>
						<TicketActionsMenu
							exam={e}
							onView={(ex) => (viewingExamId = ex.id)}
							onEdit={(ex) => onEditExam(ex)}
							onChanged={refresh}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{:else}
	<div class="empty">
		<h3>{tab === 'bank' ? $_('subjectView.tabs.bank') : tab === 'sessions' ? $_('subjectView.tabs.sessions') : $_('subjectView.tabs.students')}</h3>
		<p>{$_('subjectView.prototypeNotice')}</p>
		<button class="btn btn-primary" onclick={() => (tab = 'exams')}>{$_('subjectView.backToExams')}</button>
	</div>
{/if}

<TicketDetailModal
	open={viewingExamId !== null}
	examId={viewingExamId}
	onClose={() => (viewingExamId = null)}
/>

<ShareExamModal
	open={sharingExam !== null}
	exam={sharingExam}
	onClose={() => (sharingExam = null)}
/>
