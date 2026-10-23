<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { sessionsApi, type ApiMyState } from '$lib/api/sessions';
	import { isUnauthorized } from '$lib/api/client';
	import { ticketTitle } from '$lib/i18n/format';
	import { _ } from 'svelte-i18n';

	interface Props {
		sessionId: string;
		sessionToken: string;
		onClose: () => void;
		onSessionLost: () => void;
	}
	let { sessionId, sessionToken, onClose, onSessionLost }: Props = $props();

	let me = $state<ApiMyState | null>(null);
	let failed = $state(false);

	async function load() {
		try {
			me = await sessionsApi.me(sessionId, sessionToken);
			failed = false;
		} catch (err) {
			if (isUnauthorized(err)) onSessionLost();
			else failed = !me;
		}
	}

	onMount(() => {
		void load();
		// Verbal answers may still be graded after the exam ends — keep the score
		// current until nothing is pending any more.
		const poll = setInterval(() => {
			if (!me?.result || me.result.pending > 0) void load();
		}, 15000);
		return () => clearInterval(poll);
	});

	let result = $derived(me?.result ?? null);
	let percent = $derived(result && result.max > 0 ? Math.round((result.earned / result.max) * 100) : 0);
</script>

<div class="top">
	<div class="title">
		{me?.assignedTicket ? $ticketTitle(me.assignedTicket.title) : $_('finished.titleFallback')}
	</div>
	<div class="spacer"></div>
	<div class="pill-time">
		<Icon name="check" /> {$_('finished.pill')}
	</div>
</div>

<div class="wait-body">
	<div class="wait-left">
		<div class="wait-eyebrow">
			<span class="pulse done"></span>
			{$_('finished.eyebrow')}
		</div>

		<h1 class="wait-headline">
			{$_('finished.headline')} <em>{$_('finished.headlineEm')}</em>
		</h1>

		<p class="wait-sub">{$_('finished.subtitle')}</p>

		<div>
			<button class="btn btn-primary btn-lg" onclick={onClose}>
				{$_('finished.close')} <Icon name="arrow" />
			</button>
		</div>
	</div>

	<div class="result-card">
		{#if result}
			<div class="k">{$_('finished.scoreLabel')}</div>
			<div class="score">{result.earned}<small> / {result.max}</small></div>
			<div class="bar"><i style="width: {percent}%"></i></div>
			<div class="note">
				{#if result.pending > 0}
					{$_('finished.pending', { values: { n: result.pending } })}
				{:else}
					{$_('finished.final')}
				{/if}
			</div>
		{:else if failed}
			<div class="note">{$_('finished.loadFailed')}</div>
		{:else if me}
			<div class="note">{$_('finished.noTicket')}</div>
		{:else}
			<div class="note">{$_('common.loading')}</div>
		{/if}
	</div>
</div>
