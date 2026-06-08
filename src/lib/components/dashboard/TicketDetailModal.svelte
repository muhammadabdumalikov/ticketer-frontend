<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { examsApi, type ApiExamDetail } from '$lib/api/exams';
	import type { ApiQuestion } from '$lib/api/tickets';
	import { _ } from 'svelte-i18n';
	import { get } from 'svelte/store';

	interface Props {
		open: boolean;
		examId: string | null;
		onClose: () => void;
	}
	let { open, examId, onClose }: Props = $props();

	let detail = $state<ApiExamDetail | null>(null);
	let loading = $state(false);
	let loadError = $state('');
	let collapsed = $state<Record<string, boolean>>({});

	$effect(() => {
		if (!open || !examId) {
			detail = null;
			loadError = '';
			loading = false;
			collapsed = {};
			return;
		}
		const id = examId;
		loading = true;
		loadError = '';
		examsApi
			.get(id)
			.then((d) => {
				detail = d;
				// Default: first ticket expanded, the rest collapsed.
				collapsed = Object.fromEntries(d.tickets.map((t, i) => [t.id, i > 0]));
			})
			.catch((e) => {
				loadError = (e as Error).message;
			})
			.finally(() => {
				loading = false;
			});
	});

	function toggle(ticketId: string) {
		collapsed = { ...collapsed, [ticketId]: !collapsed[ticketId] };
	}

	let TYPE_LABEL = $derived<Record<ApiQuestion['type'], string>>({
		single: $_('ticketDetail.type.single'),
		multi: $_('ticketDetail.type.multi'),
		text: $_('ticketDetail.type.text'),
		numeric: $_('ticketDetail.type.numeric'),
		verbal: $_('ticketDetail.type.verbal')
	});

	function pillKind(status: string): string {
		if (status === 'Опубликован') return 'green';
		if (status === 'Запланирован') return 'orange';
		return '';
	}

	function formatTime(seconds: number): string {
		if (!seconds) return '—';
		const t = get(_);
		if (seconds < 60) return `${seconds} ${t('units.sec')}`;
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return s ? `${m} ${t('units.min')} ${s} ${t('units.sec')}` : `${m} ${t('units.min')}`;
	}

	let totalQuestions = $derived(
		detail?.tickets.reduce((acc, t) => acc + t.questions.length, 0) ?? 0
	);
	let totalPoints = $derived(
		detail?.tickets.reduce(
			(acc, t) => acc + t.questions.reduce((qa, q) => qa + q.points, 0),
			0
		) ?? 0
	);
</script>

<Modal {open} {onClose} width={680}>
	<div class="modal-form">
		<div class="modal-head">
			<div class="modal-eyebrow">{$_('ticketDetail.eyebrow')}</div>
			{#if loading}
				<h3>{$_('common.loading')}</h3>
			{:else if loadError}
				<h3>{$_('ticketDetail.loadError')}</h3>
				<p>{loadError}</p>
			{:else if detail}
				<h3>{detail.title}</h3>
				<div class="td-meta">
					<span class="pill {pillKind(detail.status)}">{detail.status.toUpperCase()}</span>
					<span class="td-dot">·</span>
					<span>{detail.durationMin} {$_('units.min')}</span>
					<span class="td-dot">·</span>
					<span>{detail.tickets.length} {$_('units.ticketsAbbr')}</span>
					<span class="td-dot">·</span>
					<span>{totalQuestions} {$_('units.questionsAbbr')}</span>
					<span class="td-dot">·</span>
					<span>{$_('ticketDetail.pointsCount', { values: { n: totalPoints } })}</span>
				</div>
				{#if detail.description}
					<p class="td-desc">{detail.description}</p>
				{/if}
			{/if}
		</div>

		{#if detail && !loading && !loadError}
			<div class="modal-body td-questions">
				{#each detail.tickets as ticket (ticket.id)}
					{@const isCollapsed = collapsed[ticket.id]}
					{@const ticketPoints = ticket.questions.reduce((s, q) => s + q.points, 0)}
					<div class="td-ticket {isCollapsed ? 'collapsed' : ''}">
						<button
							type="button"
							class="td-ticket-head"
							onclick={() => toggle(ticket.id)}
							aria-expanded={!isCollapsed}
						>
							<span class="td-ticket-chev {isCollapsed ? '' : 'open'}">
								<Icon name="chev" />
							</span>
							<span class="td-ticket-title">{ticket.title}</span>
							<span class="td-ticket-meta">
								{ticket.questions.length} {$_('units.questionsAbbr')} · {$_('ticketDetail.pointsCount', { values: { n: ticketPoints } })}
							</span>
						</button>

						{#if !isCollapsed}
						{#each ticket.questions as q, i (q.id)}
							<div class="td-q">
								<div class="td-q-head">
									<span class="td-q-num">{String(i + 1).padStart(2, '0')}</span>
									<span class="td-q-type">{TYPE_LABEL[q.type] ?? q.type}</span>
									<span class="td-q-meta">
										<Icon name="star" /> {q.points}
									</span>
									<span class="td-q-meta">
										<Icon name="clock" /> {formatTime(q.time)}
									</span>
								</div>
								<div class="td-q-text">{q.text || $_('ticketDetail.noText')}</div>
								{#if (q.type === 'single' || q.type === 'multi') && q.answers}
									<ul class="td-q-answers">
										{#each q.answers as a, ai (ai)}
											{@const isCorrect =
												q.type === 'single'
													? q.correct === ai
													: Array.isArray(q.correct) && q.correct.includes(ai)}
											<li class={isCorrect ? 'ok' : ''}>
												<span class="td-q-bullet">{isCorrect ? '✓' : String.fromCharCode(65 + ai)}</span>
												<span>{a || '—'}</span>
											</li>
										{/each}
									</ul>
								{/if}
								{#if q.type === 'text' && q.expected !== undefined}
									<div class="td-q-expected"><b>{$_('ticketDetail.expected')}</b> {q.expected}</div>
								{/if}
								{#if q.type === 'numeric' && q.expected !== undefined}
									<div class="td-q-expected">
										<b>{$_('ticketDetail.expected')}</b> {q.expected}{q.tolerance ? ` ± ${q.tolerance}` : ''}
									</div>
								{/if}
								{#if q.type === 'verbal' && q.rubric}
									<div class="td-q-expected"><b>{$_('ticketDetail.rubric')}</b> {q.rubric}</div>
								{/if}
							</div>
						{/each}
						{#if ticket.questions.length === 0}
							<div style="color: var(--muted); font-size: 13.5px; padding: 8px 4px;">
								{$_('ticketDetail.emptyQuestions')}
							</div>
						{/if}
						{/if}
					</div>
				{/each}
				{#if detail.tickets.length === 0}
					<div style="color: var(--muted); font-size: 13.5px; text-align: center; padding: 20px;">
						{$_('ticketDetail.emptyTickets')}
					</div>
				{/if}
			</div>
		{/if}

		<div class="modal-foot">
			<button type="button" class="btn btn-primary" onclick={onClose}>{$_('common.close')}</button>
		</div>
	</div>
</Modal>
