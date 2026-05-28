<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { goto } from '$app/navigation';
	import type { Subject } from '$lib/api/subjects';
	import { examsApi, type ApiExamListItem } from '$lib/api/exams';
	import TicketActionsMenu from './TicketActionsMenu.svelte';
	import TicketDetailModal from './TicketDetailModal.svelte';
	import ShareExamModal from './ShareExamModal.svelte';

	interface Props {
		subjects: Subject[];
		exams: ApiExamListItem[];
		onOpenSubject: (s: Subject) => void;
		onCreateExam: (s: Subject | null) => void;
		onExamsChanged?: () => void;
		onEditExam: (e: ApiExamListItem) => void;
	}
	let { subjects, exams, onOpenSubject, onCreateExam, onExamsChanged, onEditExam }: Props = $props();

	let viewingExamId = $state<string | null>(null);
	let sharingExam = $state<ApiExamListItem | null>(null);

	let statusFilter = $state('all');
	let subjectFilters = $state<string[]>([]);
	let query = $state('');
	let sort = $state('updated');
	let launching = $state<string | null>(null);

	let list = $derived.by(() => {
		let l = exams.filter((e) => {
			if (statusFilter !== 'all' && e.status !== statusFilter) return false;
			if (subjectFilters.length > 0 && !subjectFilters.includes(e.subjectId)) return false;
			if (query) {
				const q = query.toLowerCase();
				if (
					!e.title.toLowerCase().includes(q) &&
					!e.subjectName.toLowerCase().includes(q) &&
					!e.subjectCode.toLowerCase().includes(q)
				) return false;
			}
			return true;
		});
		return l.slice().sort((a, b) => {
			if (sort === 'questions') return b.questionCount - a.questionCount;
			if (sort === 'title') return a.title.localeCompare(b.title, 'ru');
			if (sort === 'subject') return a.subjectName.localeCompare(b.subjectName, 'ru');
			return 0;
		});
	});

	let counts = $derived({
		all: exams.length,
		'Опубликован': exams.filter((e) => e.status === 'Опубликован').length,
		'Запланирован': exams.filter((e) => e.status === 'Запланирован').length,
		'Черновик': exams.filter((e) => e.status === 'Черновик').length,
		'Архив': exams.filter((e) => e.status === 'Архив').length
	});

	let statusFilters = $derived([
		{ id: 'all', label: 'Все', count: counts.all },
		{ id: 'Опубликован', label: 'Опубликованные', count: counts['Опубликован'] },
		{ id: 'Запланирован', label: 'Запланированные', count: counts['Запланирован'] },
		{ id: 'Черновик', label: 'Черновики', count: counts['Черновик'] },
		{ id: 'Архив', label: 'Архив', count: counts['Архив'] }
	]);

	const sortOpts = [
		{ value: 'updated', label: 'По дате изменения' },
		{ value: 'title', label: 'По названию' },
		{ value: 'subject', label: 'По предмету' },
		{ value: 'questions', label: 'По числу вопросов' }
	];

	function toggleSubject(id: string) {
		subjectFilters = subjectFilters.includes(id)
			? subjectFilters.filter((x) => x !== id)
			: [...subjectFilters, id];
	}

	function pillKind(status: string): string {
		if (status === 'Опубликован') return 'green';
		if (status === 'Запланирован') return 'orange';
		return '';
	}

	function resetFilters() {
		subjectFilters = [];
		query = '';
		statusFilter = 'all';
	}

	function openSubjectById(id: string) {
		const subj = subjects.find((s) => s.id === id);
		if (subj) onOpenSubject(subj);
	}

	async function runExam(e: ApiExamListItem) {
		launching = e.id;
		try {
			const { sessionId } = await examsApi.launch(e.id);
			goto(`/sessions/${sessionId}`);
		} catch (err) {
			alert(`Не удалось запустить экзамен: ${(err as Error).message}`);
		} finally {
			launching = null;
		}
	}
</script>

<div class="hello">
	<div>
		<h1>Экзамены. <em>Всего {exams.length} в банке.</em></h1>
		<div class="sub">Все экзамены по вашим предметам. Используйте фильтры, чтобы найти нужный.</div>
	</div>
	<button class="btn btn-primary btn-lg" onclick={() => onCreateExam(null)}>
		<Icon name="plus" /> Создать экзамен
	</button>
</div>

<div class="t-filters">
	{#each statusFilters as f (f.id)}
		<button class="t-chip {statusFilter === f.id ? 'active' : ''}" onclick={() => (statusFilter = f.id)}>
			<span>{f.label}</span>
			<span class="t-chip-count">{f.count}</span>
		</button>
	{/each}
</div>

<div class="surface" style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
	<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
		<div style="flex: 1; min-width: 240px; display: flex; align-items: center; gap: 10px; background: var(--field); border-radius: 12px; padding: 0 14px; height: 40px;">
			<Icon name="search" />
			<input
				bind:value={query}
				placeholder="Поиск по названию экзамена, предмету или коду…"
				style="flex: 1; border: 0; outline: 0; background: transparent; font: inherit; font-size: 14px; color: var(--ink);"
			/>
		</div>
		<div class="meta-field" style="min-width: 200px; padding: 6px 12px;">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Сортировка</label>
			<div class="val">
				<Icon name="list" />
				<Dropdown value={sort} onChange={(v) => (sort = v)} variant="inline" options={sortOpts} />
			</div>
		</div>
		{#if subjectFilters.length > 0 || query || statusFilter !== 'all'}
			<button class="btn btn-ghost btn-sm" onclick={resetFilters}>Сбросить</button>
		{/if}
	</div>

	<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
		<div class="label-mono" style="margin-right: 4px;">Предметы:</div>
		{#each subjects as s (s.id)}
			{@const on = subjectFilters.includes(s.id)}
			<button
				class="subj-chip {on ? 'on' : ''}"
				onclick={() => toggleSubject(s.id)}
				style={on ? `background: ${s.color}18; color: ${s.color}; border-color: ${s.color}60;` : ''}
			>
				<span class="dot" style="background: {s.color}"></span>
				{s.code}
			</button>
		{/each}
	</div>
</div>

{#if list.length > 0}
	<div class="surface" style="padding: 14px 18px;">
		<div class="t-table">
			<div class="t-row head">
				<span>№</span>
				<span>Название экзамена</span>
				<span>Предмет</span>
				<span>Вопросов</span>
				<span>Длительность</span>
				<span>Изменено</span>
				<span>Статус</span>
				<span></span>
			</div>
			{#each list as e, i (e.subjectId + '_' + e.id)}
				<div
					class="t-row"
					role="button"
					tabindex="0"
					onclick={() => (viewingExamId = e.id)}
					onkeydown={(ev) => ev.key === 'Enter' && (viewingExamId = e.id)}
				>
					<div class="num">{String(i + 1).padStart(2, '0')}</div>
					<div>
						<div class="title">{e.title}</div>
						<div class="sub-line">Автор: {e.author}</div>
					</div>
					<div class="t-subj">
						<span class="t-sigil" style="background: {e.subjectColor}18; color: {e.subjectColor}">
							{e.subjectSigil}
						</span>
						<div style="min-width: 0;">
							<div class="t-subj-name">{e.subjectName}</div>
							<div class="t-subj-code">{e.subjectCode}</div>
						</div>
					</div>
					<div class="t-cell">{e.questionCount} вопр.</div>
					<div class="t-cell">{e.durationMin} мин</div>
					<div class="t-cell muted">{e.updated}</div>
					<div>
						<span class="pill {pillKind(e.status)}">{e.status.toUpperCase()}</span>
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
							<Icon name="play" /> {launching === e.id ? 'Запуск…' : 'Запустить'}
						</button>
						<button
							class="btn btn-outline btn-sm"
							onclick={() => (sharingExam = e)}
							title="Поделиться ссылкой"
						>
							<Icon name="share" /> Поделиться
						</button>
						<button class="btn btn-ghost btn-sm" onclick={() => openSubjectById(e.subjectId)}>
							К предмету
						</button>
						<TicketActionsMenu
							exam={e}
							onView={(ex) => (viewingExamId = ex.id)}
							onEdit={(ex) => onEditExam(ex)}
							onChanged={() => onExamsChanged?.()}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="empty">
		<h3>Экзамены не найдены</h3>
		<p>Попробуйте изменить фильтры или поисковый запрос.</p>
		<button class="btn btn-primary" onclick={resetFilters}>Сбросить фильтры</button>
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
