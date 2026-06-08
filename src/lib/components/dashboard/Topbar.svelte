<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon from '$lib/components/Icon.svelte';

	export interface Crumb {
		label: string;
		onClick?: () => void;
	}

	interface Props {
		crumbs: Crumb[];
		onPrimary?: (() => void) | null;
		primaryLabel?: string;
	}

	let { crumbs, onPrimary = null, primaryLabel }: Props = $props();

	let resolvedPrimaryLabel = $derived(primaryLabel ?? $_('topbar.newExam'));
</script>

<div class="topbar">
	<div class="crumbs">
		{#each crumbs as c, i (i)}
			{#if i > 0}<span class="sep"><Icon name="chev" /></span>{/if}
			{#if c.onClick}
				<a href="#crumb" onclick={(e) => { e.preventDefault(); c.onClick?.(); }} role="button" tabindex="0">{c.label}</a>
			{:else}
				<span class={i === crumbs.length - 1 ? 'now' : ''}>{c.label}</span>
			{/if}
		{/each}
	</div>
	<div class="spacer"></div>
	<label class="search">
		<Icon name="search" />
		<input placeholder={$_('topbar.searchPlaceholder')} />
		<kbd>⌘ K</kbd>
	</label>
	<div class="ibtn-circle" role="button" tabindex="0"><Icon name="bell" /><span class="badge"></span></div>
	{#if onPrimary}
		<button class="btn btn-primary" onclick={onPrimary}>
			<Icon name="plus" /> {resolvedPrimaryLabel}
		</button>
	{/if}
</div>
