<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { examsApi, type ApiExamListItem } from '$lib/api/exams';
	import { _ } from 'svelte-i18n';

	interface Props {
		open: boolean;
		exam: ApiExamListItem | null;
		onClose: () => void;
	}
	let { open, exam, onClose }: Props = $props();

	let loading = $state(false);
	let loadError = $state('');
	let sessionId = $state<string | null>(null);
	let reused = $state(false);
	let copied = $state(false);
	let urlInputRef = $state<HTMLInputElement | undefined>();

	let url = $derived(
		sessionId && typeof window !== 'undefined'
			? `${window.location.origin}/student?session=${sessionId}`
			: ''
	);

	$effect(() => {
		if (!open || !exam) {
			sessionId = null;
			loadError = '';
			copied = false;
			return;
		}
		const id = exam.id;
		loading = true;
		loadError = '';
		copied = false;
		examsApi
			.share(id)
			.then((res) => {
				sessionId = res.sessionId;
				reused = res.reused;
			})
			.catch((err) => {
				loadError = (err as Error).message;
			})
			.finally(() => {
				loading = false;
			});
	});

	async function copy() {
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			// Fallback: select the field so the user can ⌘C
			urlInputRef?.select();
		}
	}

	function selectAll() {
		urlInputRef?.select();
	}
</script>

<Modal {open} {onClose} width={560}>
	<div class="modal-form">
		<div class="modal-head">
			<div class="modal-eyebrow">{$_('shareExam.eyebrow')}</div>
			<h3>{exam?.title ?? ''}</h3>
			<p>
				{$_('shareExam.description')}
			</p>
		</div>

		<div class="modal-body">
			{#if loading}
				<div style="text-align: center; color: var(--muted); padding: 16px;">{$_('shareExam.gettingLink')}</div>
			{:else if loadError}
				<div class="share-err">
					<b>{$_('shareExam.linkError')}</b>
					<div style="font-size: 13px; margin-top: 4px;">{loadError}</div>
				</div>
			{:else if sessionId}
				<div class="share-url-row">
					<input
						bind:this={urlInputRef}
						class="share-url"
						readonly
						value={url}
						onclick={selectAll}
					/>
					<button type="button" class="btn btn-primary share-copy" onclick={copy}>
						<Icon name={copied ? 'check' : 'copy'} />
						{copied ? $_('shareExam.copied') : $_('shareExam.copy')}
					</button>
				</div>
				{#if reused}
					<div class="share-hint">
						<Icon name="bolt" /> {$_('shareExam.hintReused')}
					</div>
				{:else}
					<div class="share-hint">
						<Icon name="check" /> {$_('shareExam.hintNew')}
					</div>
				{/if}
			{/if}
		</div>

		<div class="modal-foot">
			<button type="button" class="btn btn-ghost" onclick={onClose}>{$_('common.close')}</button>
		</div>
	</div>
</Modal>
