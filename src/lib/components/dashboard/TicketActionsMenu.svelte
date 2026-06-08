<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { examsApi, type ApiExamListItem } from '$lib/api/exams';
	import { _ } from 'svelte-i18n';

	interface Props {
		exam: ApiExamListItem;
		onView: (e: ApiExamListItem) => void;
		onEdit: (e: ApiExamListItem) => void;
		onChanged: () => void;
	}
	let { exam, onView, onEdit, onChanged }: Props = $props();

	let open = $state(false);
	let confirming = $state(false);
	let busy = $state(false);
	let err = $state('');
	let root: HTMLDivElement | undefined = $state();

	function close() {
		open = false;
		confirming = false;
		err = '';
	}

	function onDocClick(e: MouseEvent) {
		if (root && !root.contains(e.target as Node)) close();
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	$effect(() => {
		if (!open) return;
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	function handleView() {
		onView(exam);
		close();
	}

	function handleEdit() {
		onEdit(exam);
		close();
	}

	async function handlePublish() {
		if (busy) return;
		busy = true;
		err = '';
		try {
			await examsApi.publish(exam.id);
			onChanged();
			close();
		} catch (e) {
			err = (e as Error).message;
		} finally {
			busy = false;
		}
	}

	async function handleDelete() {
		if (busy) return;
		busy = true;
		err = '';
		try {
			await examsApi.remove(exam.id);
			onChanged();
			close();
		} catch (e) {
			err = (e as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<div class="t-menu" bind:this={root}>
	<button
		type="button"
		class="btn btn-ghost btn-sm"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<Icon name="more" />
	</button>

	{#if open}
		<div class="t-menu-pop" role="menu">
			<button type="button" class="t-menu-item" onclick={handleView} role="menuitem">
				<span class="t-menu-ic"><Icon name="eye" /></span>
				<span>{$_('common.view')}</span>
			</button>
			<button type="button" class="t-menu-item" onclick={handleEdit} role="menuitem">
				<span class="t-menu-ic"><Icon name="key" /></span>
				<span>{$_('common.edit')}</span>
			</button>
			{#if exam.status === 'Черновик'}
				<button
					type="button"
					class="t-menu-item"
					onclick={handlePublish}
					disabled={busy}
					role="menuitem"
				>
					<span class="t-menu-ic"><Icon name="check" /></span>
					<span>{busy ? $_('common.publishing') : $_('common.publish')}</span>
				</button>
			{/if}
			<div class="t-menu-sep"></div>
			{#if !confirming}
				<button
					type="button"
					class="t-menu-item t-menu-danger"
					onclick={() => (confirming = true)}
					role="menuitem"
				>
					<span class="t-menu-ic"><Icon name="trash" /></span>
					<span>{$_('common.delete')}</span>
				</button>
			{:else}
				<div class="t-menu-confirm">
					<div class="t-menu-confirm-text">{$_('ticketActions.confirmDelete', { values: { title: exam.title } })}</div>
					<div class="t-menu-confirm-row">
						<button
							type="button"
							class="btn btn-ghost btn-sm"
							onclick={() => (confirming = false)}
							disabled={busy}
						>
							{$_('common.cancel')}
						</button>
						<button
							type="button"
							class="btn btn-primary btn-sm t-menu-confirm-go"
							onclick={handleDelete}
							disabled={busy}
						>
							{busy ? $_('common.deleting') : $_('common.delete')}
						</button>
					</div>
				</div>
			{/if}
			{#if err}
				<div class="t-menu-err">{err}</div>
			{/if}
		</div>
	{/if}
</div>
