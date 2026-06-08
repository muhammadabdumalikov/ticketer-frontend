<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon from '$lib/components/Icon.svelte';
	import SubjectCard from './SubjectCard.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { subjectsApi, type Subject } from '$lib/api/subjects';

	interface Props {
		subjects: Subject[];
		onOpenSubject: (s: Subject) => void;
		onAddSubject: () => void;
		onMockCreated?: () => void;
	}
	let { subjects, onOpenSubject, onAddSubject, onMockCreated }: Props = $props();

	let mocking = $state(false);
	let mockError = $state('');

	let hasMock = $derived(subjects.some((s) => s.code.startsWith('DEMO-')));

	async function createMock() {
		if (mocking) return;
		mocking = true;
		mockError = '';
		try {
			await subjectsApi.createMock();
			onMockCreated?.();
		} catch (err) {
			mockError = (err as Error).message;
		} finally {
			mocking = false;
		}
	}

	async function removeMock() {
		if (mocking) return;
		mocking = true;
		mockError = '';
		try {
			await subjectsApi.removeMock();
			onMockCreated?.();
		} catch (err) {
			mockError = (err as Error).message;
		} finally {
			mocking = false;
		}
	}

	let query = $state('');
	let sort = $state('name');
	let filter = $state<'all' | 'live' | 'active' | 'draft'>('all');

	let list = $derived.by(() => {
		let l = subjects.filter((s) => {
			if (filter === 'live' && s.status !== 'live') return false;
			if (filter === 'active' && s.status !== 'active' && s.status !== 'live') return false;
			if (filter === 'draft' && s.status !== 'draft') return false;
			if (query) {
				const q = query.toLowerCase();
				if (!s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
			}
			return true;
		});
		return l.slice().sort((a, b) => {
			if (sort === 'name') return a.name.localeCompare(b.name, 'ru');
			if (sort === 'tickets') return b.tickets - a.tickets;
			if (sort === 'students') return b.students - a.students;
			if (sort === 'progress') return b.progress - a.progress;
			return 0;
		});
	});

	let filters = $derived<Array<{ id: 'all' | 'live' | 'active' | 'draft'; label: string }>>([
		{ id: 'all', label: $_('common.all') },
		{ id: 'live', label: $_('subjects.filterLive') },
		{ id: 'active', label: $_('subjects.filterActive') },
		{ id: 'draft', label: $_('subjects.filterDraft') }
	]);

	let sortOpts = $derived([
		{ value: 'name', label: $_('subjects.sortName') },
		{ value: 'tickets', label: $_('subjects.sortTickets') },
		{ value: 'students', label: $_('subjects.sortStudents') },
		{ value: 'progress', label: $_('subjects.sortProgress') }
	]);
</script>

<div class="hello">
	<div>
		<h1>{$_('subjects.title')} <em>{$_('subjects.total', { values: { count: subjects.length } })}</em></h1>
		<div class="sub">{$_('subjects.subtitle')}</div>
	</div>
	<div style="display: flex; gap: 8px;">
		{#if hasMock}
			<button
				class="btn btn-danger btn-lg"
				onclick={removeMock}
				disabled={mocking}
				title={$_('subjects.removeMockTitle')}
			>
				<Icon name="trash" /> {mocking ? $_('subjects.removingMock') : $_('subjects.removeMock')}
			</button>
		{:else}
			<button
				class="btn btn-outline btn-lg"
				onclick={createMock}
				disabled={mocking}
				title={$_('subjects.createMockTitle')}
			>
				<Icon name="bolt" /> {mocking ? $_('common.creating') : $_('subjects.showMock')}
			</button>
		{/if}
		<button class="btn btn-primary btn-lg" onclick={onAddSubject}>
			<Icon name="plus" /> {$_('subjects.addSubject')}
		</button>
	</div>
</div>

{#if mockError}
	<div style="background: var(--accent-soft); color: var(--accent); padding: 10px 14px; border-radius: 12px; font-size: 13px;">
		{$_('subjects.mockError', { values: { error: mockError } })}
	</div>
{/if}

<div class="surface" style="padding: 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
	<div class="tabs2">
		{#each filters as f (f.id)}
			<button class={filter === f.id ? 'active' : ''} onclick={() => (filter = f.id)}>{f.label}</button>
		{/each}
	</div>
	<div style="flex: 1; min-width: 220px; display: flex; align-items: center; gap: 10px; background: var(--field); border-radius: 12px; padding: 0 14px; height: 40px;">
		<Icon name="search" />
		<input
			bind:value={query}
			placeholder={$_('subjects.searchPlaceholder')}
			style="flex: 1; border: 0; outline: 0; background: transparent; font: inherit; font-size: 14px; color: var(--ink);"
		/>
	</div>
	<div class="meta-field" style="min-width: 180px; padding: 6px 12px;">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>{$_('common.sort')}</label>
		<div class="val">
			<Icon name="list" />
			<Dropdown value={sort} onChange={(v) => (sort = v)} variant="inline" options={sortOpts} />
		</div>
	</div>
</div>

{#if list.length > 0}
	<div class="subjects">
		{#each list as s (s.id)}
			<SubjectCard subj={s} onOpen={onOpenSubject} />
		{/each}
	</div>
{:else}
	<div class="empty">
		<h3>{$_('common.notFound')}</h3>
		<p>{$_('subjects.emptyHint')}</p>
		<button class="btn btn-primary" onclick={() => { query = ''; filter = 'all'; }}>{$_('common.resetFilters')}</button>
	</div>
{/if}
