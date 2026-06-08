<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon from '$lib/components/Icon.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { subjectsApi, type CreateSubjectInput, type Subject } from '$lib/api/subjects';

	interface Props {
		open: boolean;
		onClose: () => void;
		onAdded: (s: Subject) => void;
	}
	let { open, onClose, onAdded }: Props = $props();

	let saving = $state(false);
	let saveError = $state('');

	const COLORS = [
		'#FF4D1F', '#1F9D55', '#6F46D7', '#0F62FE',
		'#0A8F90', '#D43872', '#E11D48', '#F59E0B'
	];

	let name = $state('');
	let code = $state('');
	let color = $state(COLORS[0]);
	let students = $state(40);
	let sigilManual = $state('');

	function deriveSigil(s: string): string {
		if (!s) return '??';
		const parts = s.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	let sigil = $derived(sigilManual || deriveSigil(name) || $_('addSubject.sigilFallback'));
	let valid = $derived(name.trim().length >= 2 && code.trim().length >= 2);

	$effect(() => {
		if (open) {
			name = '';
			code = '';
			color = COLORS[0];
			students = 40;
			sigilManual = '';
		}
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid || saving) return;
		saving = true;
		saveError = '';
		const body: CreateSubjectInput = {
			name: name.trim(),
			code: code.trim().toUpperCase(),
			sigil,
			color,
			status: 'draft'
		};
		try {
			const created = await subjectsApi.create(body);
			onAdded(created);
			onClose();
		} catch (err) {
			saveError = (err as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

<Modal {open} {onClose}>
	<form onsubmit={submit} class="modal-form">
		<div class="modal-head">
			<div class="modal-eyebrow">{$_('addSubject.eyebrow')}</div>
			<h3>{$_('addSubject.title')}</h3>
			<p>{$_('addSubject.description')}</p>
		</div>

		<div class="modal-body">
			<div class="modal-row" style="grid-template-columns: 76px 1fr;">
				<div class="modal-preview">
					<div class="modal-sigil" style="background: {color}">{sigil}</div>
				</div>
				<div style="display: flex; flex-direction: column; gap: 14px; min-width: 0;">
					<div class="m-field">
						<label for="subj-name">{$_('addSubject.nameLabel')}</label>
						<input
							id="subj-name"
							bind:value={name}
							placeholder={$_('addSubject.namePlaceholder')}
						/>
					</div>
					<div class="modal-row" style="grid-template-columns: 1fr 100px;">
						<div class="m-field">
							<label for="subj-code">{$_('addSubject.codeLabel')}</label>
							<input
								id="subj-code"
								bind:value={code}
								placeholder={$_('addSubject.codePlaceholder')}
								style="text-transform: uppercase;"
							/>
						</div>
						<div class="m-field">
							<label for="subj-sigil">{$_('addSubject.sigilLabel')}</label>
							<input
								id="subj-sigil"
								value={sigil}
								oninput={(e) => (sigilManual = e.currentTarget.value.slice(0, 3).toUpperCase())}
								placeholder={$_('addSubject.sigilPlaceholder')}
								maxlength={3}
								style="text-align: center; font-weight: 600; letter-spacing: 0.04em;"
							/>
						</div>
					</div>
				</div>
			</div>

			<div class="m-field">
				<span class="m-label" id="color-label" style="font-size: 12.5px; color: var(--ink-2); font-weight: 500;">{$_('addSubject.colorLabel')}</span>
				<div class="color-swatches" aria-labelledby="color-label">
					{#each COLORS as c (c)}
						<button
							type="button"
							class="swatch {color === c ? 'on' : ''}"
							onclick={() => (color = c)}
							style="background: {c}"
							aria-label={c}
						>
							{#if color === c}<Icon name="check" />{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="m-field">
				<label for="subj-students">{$_('addSubject.studentsLabel')}</label>
				<input
					id="subj-students"
					type="number" min="0" max="500"
					bind:value={students}
				/>
			</div>
		</div>

		{#if saveError}
			<div style="padding: 0 28px 12px; color: var(--accent); font-size: 13px;">
				{saveError}
			</div>
		{/if}
		<div class="modal-foot">
			<button type="button" class="btn btn-ghost" onclick={onClose}>{$_('common.cancel')}</button>
			<button type="submit" class="btn btn-primary" disabled={!valid || saving}>
				<Icon name="plus" /> {saving ? $_('common.creating') : $_('addSubject.submit')}
			</button>
		</div>
	</form>
</Modal>
