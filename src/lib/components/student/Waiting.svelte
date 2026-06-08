<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Socket } from 'socket.io-client';
	import { connectAsStudent } from '$lib/socket';
	import { sessionsApi, type ApiRoomMember, type ApiSession } from '$lib/api/sessions';
	import { deriveSig } from '$lib/api/adapters';
	import { _ } from 'svelte-i18n';

	interface Props {
		sessionId: string;
		sessionToken: string;
		memberId: string;
		session: ApiSession | null;
		onStarted: () => void;
	}
	let { sessionId, sessionToken, memberId, session, onStarted }: Props = $props();

	let roster = $state<ApiRoomMember[]>([]);
	let sock: Socket | null = null;

	$effect(() => {
		// initial roster fetch (no-auth endpoint? actually requires teacher JWT). Skip — rely on WS broadcasts.
		// As a fallback, we only know about ourselves until session:join fires.
		sock = connectAsStudent(sessionId, sessionToken);
		sock.on('session:join', (payload: { member: ApiRoomMember & { online: boolean } }) => {
			roster = [...roster.filter((m) => m.id !== payload.member.id), payload.member as ApiRoomMember];
		});
		sock.on('session:start', () => {
			onStarted();
		});
		// Fallback: if the session:start broadcast is ever missed (socket drop,
		// reconnect, late join), poll our own state so the page still flips to the
		// ticket on its own — this is the "auto-refresh" the UI promises.
		const poll = setInterval(() => onStarted(), 3000);
		return () => {
			clearInterval(poll);
			sock?.disconnect();
		};
	});

	let myselfInRoster = $derived(roster.some((m) => m.id === memberId));

	// Always show self in roster
	let displayRoster = $derived(
		myselfInRoster
			? roster
			: [
					...roster,
					{
						id: memberId,
						name: $_('waiting.you'),
						groupName: '',
						studentNumber: null,
						online: true,
						assignedTicketId: null,
						joinedAt: new Date().toISOString()
					} as ApiRoomMember
				]
	);
</script>

<div class="top">
	<div class="title">
		{session?.ticket?.subjectName ?? $_('waiting.subjectFallback')}
		<span class="info" title={$_('waiting.info')}>i</span>
	</div>
	<div class="spacer"></div>
	<div class="pill-time">
		<span style="width: 8px; height: 8px; border-radius: 999px; background: var(--accent); display: inline-block;"></span>
		{$_('waiting.pill')}
	</div>
</div>

<div class="wait-body">
	<div class="wait-left">
		<div class="wait-eyebrow">
			<span class="pulse"></span>
			{$_('waiting.eyebrow')}
		</div>

		<h1 class="wait-headline">
			{$_('waiting.headline')} <em>{$_('waiting.headlineEm')}</em>
		</h1>

		<p class="wait-sub">
			{$_('waiting.subtitle')}
		</p>

		<div class="wait-meta">
			<div class="it">
				<div class="k">{$_('waiting.metaSubject')}</div>
				<div class="v">{session?.ticket?.subjectName ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">{$_('waiting.metaCode')}</div>
				<div class="v">{session?.ticket?.subjectCode ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">{$_('waiting.metaTicket')}</div>
				<div class="v">{session?.ticket?.title ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">{$_('waiting.metaDuration')}</div>
				<div class="v">{session?.ticket?.durationMin ?? '—'}<small> {$_('units.min')}</small></div>
			</div>
		</div>

		<div class="wait-hint">
			<Icon name="shield" />
			<div>
				<b>{$_('waiting.hintTitle')}</b> {$_('waiting.hintText')}
			</div>
		</div>
	</div>

	<div class="wait-right">
		<div class="wait-right-head">
			<h3>{$_('waiting.inRoom')}</h3>
			<span class="count"><b>{displayRoster.length}</b></span>
		</div>

		<div class="students">
			{#each displayRoster as s (s.id)}
				{@const isMe = s.id === memberId}
				<div class="stu {isMe ? 'me' : ''}">
					<div class="av {isMe ? 'me' : ''}">{deriveSig(s.name)}</div>
					<span class="name">{s.name}</span>
					{#if isMe}
						<span class="me-tag">{$_('waiting.meTag')}</span>
					{:else}
						<span class="led"></span>
					{/if}
				</div>
			{/each}
		</div>

		<div style="display: flex; gap: 10px; align-items: center; color: var(--muted); font-size: 13px; padding-top: 4px;">
			<Icon name="bell" />
			<span>{$_('waiting.autoRefresh')}</span>
		</div>
	</div>
</div>
