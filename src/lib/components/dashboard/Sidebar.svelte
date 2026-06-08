<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import UserMenu from '$lib/components/dashboard/UserMenu.svelte';

	interface Props {
		active: string;
		onNavigate: (id: string) => void;
		counts: { subjects: number; tickets: number };
	}

	let { active, onNavigate, counts }: Props = $props();

	const items: Array<{ id: string; label: string; icon: IconName; count?: number; disabled?: boolean }> = $derived([
		{ id: 'home', label: $_('nav.home'), icon: 'home' },
		{ id: 'subjects', label: $_('nav.subjects'), icon: 'book', count: counts.subjects },
		{ id: 'tickets', label: $_('nav.tickets'), icon: 'ticket', count: counts.tickets },
		{ id: 'sessions', label: $_('nav.sessions'), icon: 'calendar', disabled: true },
		{ id: 'bank', label: $_('nav.questionBank'), icon: 'bank', disabled: true },
		{ id: 'analytics', label: $_('nav.analytics'), icon: 'chart', disabled: true }
	]);
</script>

<aside class="sidebar">
	<div class="sb-brand">
		<span class="logo" aria-hidden="true"></span>
		<span class="mark">ticketer<span>.</span></span>
	</div>

	<div>
		<div class="sb-section">{$_('nav.workspace')}</div>
		{#each items as it (it.id)}
			<div
				class="sb-item {active === it.id ? 'active' : ''} {it.disabled ? 'disabled' : ''}"
				onclick={() => !it.disabled && onNavigate(it.id)}
				onkeydown={(e) => e.key === 'Enter' && !it.disabled && onNavigate(it.id)}
				aria-disabled={it.disabled || undefined}
				role="button"
				tabindex={it.disabled ? -1 : 0}
			>
				<span class="ic"><Icon name={it.icon} /></span>
				<span>{it.label}</span>
				{#if it.disabled}<span class="soon">{$_('common.soon')}</span>{/if}
				{#if it.count != null}<span class="count">{it.count}</span>{/if}
			</div>
		{/each}
	</div>

	<div>
		<div class="sb-section">{$_('nav.account')}</div>
		<div
			class="sb-item {active === 'settings' ? 'active' : ''}"
			onclick={() => onNavigate('settings')}
			onkeydown={(e) => e.key === 'Enter' && onNavigate('settings')}
			role="button"
			tabindex="0"
		>
			<span class="ic"><Icon name="settings" /></span>
			<span>{$_('nav.settings')}</span>
		</div>
		<div class="sb-item" role="button" tabindex="0">
			<span class="ic"><Icon name="help" /></span>
			<span>{$_('nav.help')}</span>
		</div>
	</div>

	<UserMenu />
</aside>
