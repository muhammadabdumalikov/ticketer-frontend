<script lang="ts">
	import type { Snippet } from 'svelte';
	import { _ } from 'svelte-i18n';

	export interface DropdownOption {
		value: string;
		label: string;
		hint?: string;
	}

	interface Props {
		value: string;
		onChange: (v: string) => void;
		options: DropdownOption[];
		placeholder?: string;
		icon?: Snippet;
		align?: 'left' | 'right';
		variant?: 'inline' | 'solid';
		size?: 'sm' | 'md';
		disabled?: boolean;
	}

	let {
		value,
		onChange,
		options,
		placeholder,
		icon,
		align = 'left',
		variant = 'inline',
		size = 'md',
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let root: HTMLDivElement | undefined = $state();

	let current = $derived(options.find((o) => o.value === value));
	let currentLabel = $derived(current ? current.label : (placeholder ?? $_('common.choose')));

	function onDocClick(e: MouseEvent) {
		if (root && !root.contains(e.target as Node)) open = false;
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
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

	function pick(o: DropdownOption) {
		onChange(o.value);
		open = false;
	}
</script>

<div class="dd {align === 'right' ? 'dd-right' : ''}" bind:this={root}>
	<button
		type="button"
		class="dd-trigger {variant} {size} {open ? 'open' : ''} {disabled ? 'disabled' : ''}"
		onclick={() => !disabled && (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		{disabled}
	>
		{#if icon}<span class="dd-icon">{@render icon()}</span>{/if}
		<span class="dd-value {current ? '' : 'placeholder'}">{currentLabel}</span>
		<span class="dd-chev">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6 9l6 6 6-6"/>
			</svg>
		</span>
	</button>

	{#if open}
		<div class="dd-menu" role="listbox">
			{#each options as o (o.value)}
				{@const isSel = o.value === value}
				<button type="button" class="dd-item {isSel ? 'sel' : ''}" onclick={() => pick(o)} role="option" aria-selected={isSel}>
					<span class="dd-item-main">
						<span class="dd-item-label">{o.label}</span>
						{#if o.hint}<span class="dd-item-hint">{o.hint}</span>{/if}
					</span>
					{#if isSel}
						<span class="dd-item-check">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="4 12 10 18 20 6"/>
							</svg>
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
