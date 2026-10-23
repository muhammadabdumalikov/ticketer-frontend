<script lang="ts">
	import '$lib/styles/student.css';
	import { onMount } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import Join, { type JoinPayload } from '$lib/components/student/Join.svelte';
	import Waiting from '$lib/components/student/Waiting.svelte';
	import Ticket from '$lib/components/student/Ticket.svelte';
	import Finished from '$lib/components/student/Finished.svelte';
	import { sessionsApi, type ApiAssignedTicket, type ApiPublicSession } from '$lib/api/sessions';
	import { errorCode, isUnauthorized } from '$lib/api/client';
	import { clearSeat, loadSeat, saveSeat, type StudentSeat } from '$lib/stores/student-seat';
	import { _ } from 'svelte-i18n';
	import { get } from 'svelte/store';

	type View = 'join' | 'waiting' | 'taking' | 'finished';

	// Server error codes → messages in the student's language.
	const JOIN_ERRORS: Record<string, string> = {
		session_not_found: 'join.sessionNotFound',
		session_finished: 'join.sessionFinished',
		seat_in_use: 'join.seatInUse',
		identity_mismatch: 'join.identityMismatch'
	};

	let view = $state<View>('join');
	let sessionId = $state<string>('');
	let sessionToken = $state<string>('');
	let memberId = $state<string>('');
	let session = $state<ApiPublicSession | null>(null);
	let assignedTicket = $state<ApiAssignedTicket | null>(null);
	let joinBusy = $state(false);
	let joinError = $state('');
	// A seat remembered from another tab, offered on the join form.
	let resumeSeat = $state<StudentSeat | null>(null);

	onMount(() => {
		document.body.classList.add('page-student');
		const url = new URL(window.location.href);
		const fromUrl = url.searchParams.get('session');
		if (fromUrl) {
			sessionId = fromUrl;
			const found = loadSeat(fromUrl);
			if (found?.thisTab) void resume(found.seat);
			else if (found) resumeSeat = found.seat;
		}
		return () => document.body.classList.remove('page-student');
	});

	// Return to the exam with a remembered seat, landing on whichever view the
	// session is in now.
	async function resume(seat: StudentSeat) {
		resumeSeat = null;
		sessionToken = seat.sessionToken;
		memberId = seat.memberId;
		try {
			const me = await sessionsApi.me(sessionId, seat.sessionToken);
			saveSeat(sessionId, seat);
			if (me.session.status === 'finished') {
				view = 'finished';
				return;
			}
			if (me.assignedTicket) {
				assignedTicket = me.assignedTicket;
				view = 'taking';
			} else {
				view = 'waiting';
			}
		} catch (err) {
			if (isUnauthorized(err)) leave(get(_)('join.sessionLost'));
			// Network trouble: wait in the room, its poll retries until the API answers.
			else view = 'waiting';
		}
	}

	// Drop the seat and go back to the join form with a reason.
	function leave(message: string) {
		clearSeat(sessionId);
		sessionToken = '';
		memberId = '';
		assignedTicket = null;
		joinError = message;
		view = 'join';
	}

	function handleSessionLost() {
		leave(get(_)('join.sessionLost'));
	}

	$effect(() => {
		if (!sessionId) return;
		const id = sessionId;
		sessionsApi
			.getPublic(id)
			.then((s) => {
				session = s;
				// A finished exam can't be joined — say so before the student fills in the form.
				if (s.status === 'finished' && view === 'join' && !joinError) {
					joinError = get(_)('join.sessionFinished');
				}
			})
			.catch((err) => {
				if (errorCode(err) === 'session_not_found' && view === 'join') {
					joinError = get(_)('join.sessionNotFound');
				}
				// anything else (network): the form still works, it just shows no exam details
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
			resumeSeat = null;
			saveSeat(id, { sessionToken: res.sessionToken, memberId: res.memberId, name: payload.name });
			// Keep the session in the URL so a reload lands back here.
			if (new URL(window.location.href).searchParams.get('session') !== id) {
				replaceState(`?session=${id}`, {});
			}
			// The id may have been typed in by hand — load the exam details for it.
			try {
				session = await sessionsApi.getPublic(id);
			} catch {
				// Waiting can run without the details
			}
			view = 'waiting';
			// In case the session is already live, transition immediately:
			await checkAlreadyStarted();
		} catch (err) {
			const code = errorCode(err);
			const key = code ? JOIN_ERRORS[code] : undefined;
			joinError = key ? get(_)(key) : (err as Error).message;
		} finally {
			joinBusy = false;
		}
	}

	async function checkAlreadyStarted() {
		try {
			const me = await sessionsApi.me(sessionId, sessionToken);
			if (me.session.status === 'finished') {
				view = 'finished';
			} else if (me.assignedTicket) {
				assignedTicket = me.assignedTicket;
				view = 'taking';
			}
		} catch (err) {
			if (isUnauthorized(err)) handleSessionLost();
			// otherwise transient — the waiting room polls again
		}
	}

	async function handleStarted() {
		await checkAlreadyStarted();
	}

	function exitExam() {
		clearSeat(sessionId);
		goto('/');
	}

	// Try to derive minimal exam meta from session.ticket if available; otherwise leave null.
	let examMeta = $derived(
		session
			? {
					subject: session.subjectName,
					code: session.subjectCode,
					date: '',
					duration: session.durationMin,
					teacher: session.teacherName
				}
			: null
	);
</script>

<svelte:head><title>{$_('titles.exam')}</title></svelte:head>

<div class="stage">
	<div class="frame">
		{#if view === 'join'}
			<Join
				examInfo={examMeta}
				hasSession={!!sessionId}
				busy={joinBusy}
				errorMessage={joinError}
				onJoin={handleJoin}
				resumeName={resumeSeat?.name}
				onResume={() => resumeSeat && resume(resumeSeat)}
			/>
		{:else if view === 'waiting'}
			<Waiting
				{sessionId}
				{sessionToken}
				{memberId}
				{session}
				onStarted={handleStarted}
				onSessionLost={handleSessionLost}
			/>
		{:else if view === 'taking' && assignedTicket}
			<Ticket
				{sessionId}
				{sessionToken}
				{memberId}
				{assignedTicket}
				onExit={exitExam}
				onEnded={() => (view = 'finished')}
				onSessionLost={handleSessionLost}
			/>
		{:else if view === 'finished'}
			<Finished {sessionId} {sessionToken} onClose={exitExam} onSessionLost={handleSessionLost} />
		{/if}
	</div>
</div>
