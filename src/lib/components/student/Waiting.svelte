<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Socket } from 'socket.io-client';
	import { connectAsStudent } from '$lib/socket';
	import { sessionsApi, type ApiRoomMember, type ApiSession } from '$lib/api/sessions';
	import { deriveSig } from '$lib/api/adapters';

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
		return () => {
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
						name: 'Вы',
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
		{session?.ticket?.subjectName ?? 'Экзамен'}
		<span class="info" title="Информация">i</span>
	</div>
	<div class="spacer"></div>
	<div class="pill-time">
		<span style="width: 8px; height: 8px; border-radius: 999px; background: var(--accent); display: inline-block;"></span>
		Ожидание
	</div>
</div>

<div class="wait-body">
	<div class="wait-left">
		<div class="wait-eyebrow">
			<span class="pulse"></span>
			ЭКЗАМЕН ВОТ-ВОТ НАЧНЁТСЯ
		</div>

		<h1 class="wait-headline">
			Ожидайте начала экзамена. <em>Преподаватель скоро запустит сессию.</em>
		</h1>

		<p class="wait-sub">
			Когда все студенты будут в комнате, преподаватель нажмёт «Начать», и каждому
			автоматически выпадет билет. Не закрывайте эту вкладку.
		</p>

		<div class="wait-meta">
			<div class="it">
				<div class="k">Предмет</div>
				<div class="v">{session?.ticket?.subjectName ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">Код</div>
				<div class="v">{session?.ticket?.subjectCode ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">Билет</div>
				<div class="v">{session?.ticket?.title ?? '—'}</div>
			</div>
			<div class="it">
				<div class="k">Длительность</div>
				<div class="v">{session?.ticket?.durationMin ?? '—'}<small> мин</small></div>
			</div>
		</div>

		<div class="wait-hint">
			<Icon name="shield" />
			<div>
				<b>Не покидайте страницу.</b> Если вы случайно закроете вкладку,
				откройте ту же ссылку — вы вернётесь в комнату.
			</div>
		</div>
	</div>

	<div class="wait-right">
		<div class="wait-right-head">
			<h3>В комнате</h3>
			<span class="count"><b>{displayRoster.length}</b></span>
		</div>

		<div class="students">
			{#each displayRoster as s (s.id)}
				{@const isMe = s.id === memberId}
				<div class="stu {isMe ? 'me' : ''}">
					<div class="av {isMe ? 'me' : ''}">{deriveSig(s.name)}</div>
					<span class="name">{s.name}</span>
					{#if isMe}
						<span class="me-tag">ВЫ</span>
					{:else}
						<span class="led"></span>
					{/if}
				</div>
			{/each}
		</div>

		<div style="display: flex; gap: 10px; align-items: center; color: var(--muted); font-size: 13px; padding-top: 4px;">
			<Icon name="bell" />
			<span>Когда экзамен начнётся, страница обновится автоматически.</span>
		</div>
	</div>
</div>
