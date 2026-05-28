<script lang="ts">
	import '$lib/styles/student.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Join, { type JoinPayload } from '$lib/components/student/Join.svelte';
	import Waiting from '$lib/components/student/Waiting.svelte';
	import Ticket from '$lib/components/student/Ticket.svelte';
	import { sessionsApi, type ApiAssignedTicket, type ApiSession } from '$lib/api/sessions';

	type View = 'join' | 'waiting' | 'taking';

	let view = $state<View>('join');
	let sessionId = $state<string>('');
	let sessionToken = $state<string>('');
	let memberId = $state<string>('');
	let session = $state<ApiSession | null>(null);
	let assignedTicket = $state<ApiAssignedTicket | null>(null);
	let joinBusy = $state(false);
	let joinError = $state('');

	onMount(() => {
		document.body.classList.add('page-student');
		const url = new URL(window.location.href);
		const fromUrl = url.searchParams.get('session');
		if (fromUrl) sessionId = fromUrl;
		return () => document.body.classList.remove('page-student');
	});

	$effect(() => {
		if (!sessionId) return;
		sessionsApi.get(sessionId).then((s) => {
			session = s;
			// If session has already started and we don't yet have a member, stay on join.
		}).catch(() => {
			// We don't surface this as a hard error — the student may not have permission yet.
		});
	});

	async function handleJoin(payload: JoinPayload) {
		joinBusy = true;
		joinError = '';
		const id = sessionId || payload.sessionId;
		try {
			const res = await sessionsApi.join(id, {
				name: payload.name,
				group: payload.group,
				studentNumber: payload.studentNumber || undefined
			});
			sessionId = id;
			sessionToken = res.sessionToken;
			memberId = res.memberId;
			// Try to fetch session meta + my state
			try {
				session = await sessionsApi.get(id);
			} catch {
				// session.get requires teacher auth; fall through, Waiting can run without meta
			}
			view = 'waiting';
			// In case the session is already live, transition immediately:
			await checkAlreadyStarted();
		} catch (err) {
			joinError = (err as Error).message;
		} finally {
			joinBusy = false;
		}
	}

	async function checkAlreadyStarted() {
		try {
			const me = await sessionsApi.me(sessionId);
			if (me.assignedTicket) {
				assignedTicket = me.assignedTicket;
				view = 'taking';
			}
		} catch {
			// expected before session:start
		}
	}

	async function handleStarted() {
		await checkAlreadyStarted();
	}

	function exitExam() {
		goto('/');
	}

	// Try to derive minimal exam meta from session.ticket if available; otherwise leave null.
	let examMeta = $derived(
		session?.ticket
			? {
					subject: session.ticket.subjectName,
					code: session.ticket.subjectCode,
					date: '',
					duration: session.ticket.durationMin,
					teacher: ''
				}
			: null
	);
</script>

<svelte:head><title>Ticketer — Экзамен</title></svelte:head>

<div class="stage">
	<div class="frame">
		{#if view === 'join'}
			<Join
				examInfo={examMeta}
				hasSession={!!sessionId}
				busy={joinBusy}
				errorMessage={joinError}
				onJoin={handleJoin}
			/>
		{:else if view === 'waiting'}
			<Waiting
				{sessionId}
				{sessionToken}
				{memberId}
				{session}
				onStarted={handleStarted}
			/>
		{:else if view === 'taking' && assignedTicket}
			<Ticket
				{sessionId}
				{sessionToken}
				{memberId}
				{assignedTicket}
				onExit={exitExam}
			/>
		{/if}
	</div>
</div>
