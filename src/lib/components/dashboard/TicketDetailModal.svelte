<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { examsApi, type ApiExamDetail } from '$lib/api/exams';
	import type { ApiQuestion } from '$lib/api/tickets';

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

	const TYPE_LABEL: Record<ApiQuestion['type'], string> = {
		single: 'Один ответ',
		multi: 'Несколько',
		text: 'Текст',
		numeric: 'Число',
		verbal: 'Устный'
	};

	function pillKind(status: string): string {
		if (status === 'Опубликован') return 'green';
		if (status === 'Запланирован') return 'orange';
		return '';
	}

	function formatTime(seconds: number): string {
		if (!seconds) return '—';
		if (seconds < 60) return `${seconds} сек`;
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return s ? `${m} мин ${s} сек` : `${m} мин`;
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
			<div class="modal-eyebrow">Экзамен</div>
			{#if loading}
				<h3>Загружаем…</h3>
			{:else if loadError}
				<h3>Не удалось загрузить</h3>
				<p>{loadError}</p>
			{:else if detail}
				<h3>{detail.title}</h3>
				<div class="td-meta">
					<span class="pill {pillKind(detail.status)}">{detail.status.toUpperCase()}</span>
					<span class="td-dot">·</span>
					<span>{detail.durationMin} мин</span>
					<span class="td-dot">·</span>
					<span>{detail.tickets.length} бил.</span>
					<span class="td-dot">·</span>
					<span>{totalQuestions} вопр.</span>
					<span class="td-dot">·</span>
					<span>{totalPoints} баллов</span>
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
								{ticket.questions.length} вопр. · {ticketPoints} баллов
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
								<div class="td-q-text">{q.text || 'Без текста'}</div>
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
									<div class="td-q-expected"><b>Ожидается:</b> {q.expected}</div>
								{/if}
								{#if q.type === 'numeric' && q.expected !== undefined}
									<div class="td-q-expected">
										<b>Ожидается:</b> {q.expected}{q.tolerance ? ` ± ${q.tolerance}` : ''}
									</div>
								{/if}
								{#if q.type === 'verbal' && q.rubric}
									<div class="td-q-expected"><b>Рубрика:</b> {q.rubric}</div>
								{/if}
							</div>
						{/each}
						{#if ticket.questions.length === 0}
							<div style="color: var(--muted); font-size: 13.5px; padding: 8px 4px;">
								В этом билете пока нет вопросов.
							</div>
						{/if}
						{/if}
					</div>
				{/each}
				{#if detail.tickets.length === 0}
					<div style="color: var(--muted); font-size: 13.5px; text-align: center; padding: 20px;">
						У этого экзамена пока нет билетов.
					</div>
				{/if}
			</div>
		{/if}

		<div class="modal-foot">
			<button type="button" class="btn btn-primary" onclick={onClose}>Закрыть</button>
		</div>
	</div>
</Modal>
