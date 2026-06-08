<script lang="ts">
	import '$lib/styles/proctor.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Socket } from 'socket.io-client';
	import Icon from '$lib/components/Icon.svelte';
	import { sessionsApi, type ApiRoomMember, type ApiSession } from '$lib/api/sessions';
	import { ticketsApi, type ApiQuestion, type ApiTicketDetail } from '$lib/api/tickets';
	import { connectAsTeacher } from '$lib/socket';
	import { deriveSig, formatTime } from '$lib/api/adapters';
	import { _, locale } from 'svelte-i18n';
	import { get } from 'svelte/store';

	let id = $derived($page.params.id ?? '');

	let session = $state<ApiSession | null>(null);
	let ticket = $state<ApiTicketDetail | null>(null);
	let studentTicket = $state<ApiTicketDetail | null>(null);
	let loadingStudentTicket = $state(false);
	let roster = $state<ApiRoomMember[]>([]);
	let loadError = $state('');
	let busy = $state(false);
	let sock: Socket | null = null;
	const ticketCache = new Map<string, ApiTicketDetail>();

	// Active proctoring state
	let activeMemberId = $state<string | null>(null);
	let activeQuestionId = $state<string | null>(null);
	let verbalStage = $state<'idle' | 'recording' | 'finished'>('idle');
	let elapsed = $state(0);
	let score = $state(0);
	let notes = $state('');
	let toast = $state<{ name: string; score: number } | null>(null);
	let copied = $state(false);

	let activeTicket = $derived(studentTicket ?? ticket);
	let verbalQuestions = $derived(activeTicket?.questions.filter((q) => q.type === 'verbal') ?? []);
	let activeMember = $derived(roster.find((m) => m.id === activeMemberId) ?? null);
	let activeQuestion = $derived<ApiQuestion | null>(
		activeTicket?.questions.find((q) => q.id === activeQuestionId) ?? null
	);
	let copyLink = $derived(() => {
		if (typeof window === 'undefined') return '';
		return `${window.location.origin}/student?session=${id}`;
	});

	onMount(() => {
		document.body.classList.add('page-proctor');
		void load();
		return () => {
			document.body.classList.remove('page-proctor');
			sock?.disconnect();
		};
	});

	async function load() {
		try {
			const [s, r] = await Promise.all([sessionsApi.get(id), sessionsApi.roster(id)]);
			session = s;
			roster = r;
			ticket = await ticketsApi.get(s.ticketId);
			ticketCache.set(ticket.id, ticket);
			activeQuestionId = ticket.questions.find((q) => q.type === 'verbal')?.id ?? null;
			openSocket();
		} catch (err) {
			loadError = (err as Error).message;
		}
	}

	function openSocket() {
		sock = connectAsTeacher(id);
		sock.on('session:join', (payload: { member: ApiRoomMember }) => {
			roster = [...roster.filter((m) => m.id !== payload.member.id), payload.member as ApiRoomMember];
		});
		sock.on('verbal:status', (payload: { memberId: string; questionId: string; stage: 'recording' | 'finished'; durationSec?: number }) => {
			if (payload.memberId === activeMemberId && payload.questionId === activeQuestionId) {
				verbalStage = payload.stage;
				if (payload.durationSec != null) elapsed = payload.durationSec;
			}
		});
		sock.on('grade:save', () => {
			// no-op: local state is already updated by the action
		});
		sock.on('session:end', () => {
			if (session) session = { ...session, status: 'finished' };
		});
	}

	$effect(() => {
		if (verbalStage !== 'recording') return;
		const t = setInterval(() => (elapsed += 1), 1000);
		return () => clearInterval(t);
	});

	async function start() {
		busy = true;
		try {
			const updated = await sessionsApi.start(id);
			session = updated;
		} catch (err) {
			alert(`Start failed: ${(err as Error).message}`);
		} finally {
			busy = false;
		}
	}

	async function end() {
		if (!confirm(get(_)('session.confirmEnd'))) return;
		busy = true;
		try {
			const updated = await sessionsApi.end(id);
			session = updated;
		} catch (err) {
			alert(`End failed: ${(err as Error).message}`);
		} finally {
			busy = false;
		}
	}

	async function pickMember(m: ApiRoomMember) {
		activeMemberId = m.id;
		verbalStage = 'idle';
		elapsed = 0;
		score = 0;
		notes = '';

		const targetId = m.assignedTicketId ?? session?.ticketId ?? null;
		if (!targetId) {
			studentTicket = null;
			return;
		}
		if (studentTicket?.id === targetId) return;

		const cached = ticketCache.get(targetId);
		if (cached) {
			studentTicket = cached;
			activeQuestionId = cached.questions.find((q) => q.type === 'verbal')?.id ?? null;
			return;
		}

		loadingStudentTicket = true;
		try {
			const fetched = await ticketsApi.get(targetId);
			// guard against stale fetches if the teacher clicked another student meanwhile
			if (activeMemberId !== m.id) return;
			ticketCache.set(fetched.id, fetched);
			studentTicket = fetched;
			activeQuestionId = fetched.questions.find((q) => q.type === 'verbal')?.id ?? null;
		} catch (err) {
			alert(`${get(_)('session.loadStudentTicketFailed')}: ${(err as Error).message}`);
		} finally {
			loadingStudentTicket = false;
		}
	}

	$effect(() => {
		if (activeMemberId === null) studentTicket = null;
	});

	async function verbalStart() {
		if (!activeMemberId || !activeQuestionId) return;
		try {
			await sessionsApi.verbalStart(id, { memberId: activeMemberId, questionId: activeQuestionId });
			elapsed = 0;
			verbalStage = 'recording';
		} catch (err) {
			alert(`verbal/start failed: ${(err as Error).message}`);
		}
	}

	async function verbalStop() {
		if (!activeMemberId || !activeQuestionId) return;
		try {
			await sessionsApi.verbalStop(id, { memberId: activeMemberId, questionId: activeQuestionId });
			verbalStage = 'finished';
		} catch (err) {
			alert(`verbal/stop failed: ${(err as Error).message}`);
		}
	}

	function reset() {
		verbalStage = 'idle';
		elapsed = 0;
		score = 0;
		notes = '';
	}

	async function saveGrade() {
		if (!activeMemberId || !activeQuestionId || !activeMember) return;
		try {
			await sessionsApi.grade(id, {
				memberId: activeMemberId,
				questionId: activeQuestionId,
				pointsAwarded: score,
				notes: notes || undefined
			});
			toast = { name: activeMember.name, score };
			setTimeout(() => {
				toast = null;
				// move to next non-active member
				const idx = roster.findIndex((m) => m.id === activeMemberId);
				const nextMember = roster[(idx + 1) % roster.length];
				if (nextMember) {
					void pickMember(nextMember);
				} else {
					activeMemberId = null;
					reset();
				}
			}, 1500);
		} catch (err) {
			alert(`grade failed: ${(err as Error).message}`);
		}
	}

	async function copyJoinLink() {
		try {
			await navigator.clipboard.writeText(copyLink());
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			prompt(get(_)('session.copyLinkPrompt'), copyLink());
		}
	}

	let overLimit = $derived(
		activeQuestion ? elapsed > activeQuestion.time : false
	);
</script>

<svelte:head><title>{$_('titles.session')}</title></svelte:head>

<div class="stage">
	<div class="frame">
		<div class="top">
			<div class="crumbs">
				<button
					class="icon-btn"
					title={$_('common.back')}
					onclick={() => goto('/dashboard')}
					style="border: 0; background: transparent; cursor: pointer;"
				>
					<Icon name="back" />
				</button>
				<span>{$_('session.crumb')}</span>
				<span class="sep">/</span>
				<b>{session?.ticket?.subjectName ?? '…'}</b>
				<span class="sep">/</span>
				<span>{session?.ticket?.title ?? '…'}</span>
			</div>
			<div class="spacer"></div>
			{#if session?.status === 'live'}
				<div class="session-pill">
					<span class="led"></span>
					{$_('session.statusLive')}
				</div>
			{:else if session?.status === 'scheduled'}
				<div class="session-pill" style="background: var(--field); color: var(--ink-3);">
					<span class="led" style="background: var(--muted-2); box-shadow: none;"></span>
					{$_('session.statusScheduled')}
				</div>
			{:else if session?.status === 'finished'}
				<div class="session-pill" style="background: var(--field); color: var(--muted);">
					{$_('session.statusFinished')}
				</div>
			{/if}

			<button class="icon-btn" title={copied ? $_('session.copied') : $_('session.copyLink')} onclick={copyJoinLink} style="border:0; cursor: pointer;">
				<Icon name={copied ? 'check' : 'copy'} />
			</button>

			{#if session?.status === 'scheduled'}
				<button class="big-btn start" style="min-width: auto; padding: 10px 18px; font-size: 14px;" onclick={start} disabled={busy}>
					<Icon name="play" /> {$_('session.start')}
				</button>
			{:else if session?.status === 'live'}
				<button class="big-btn stop" style="min-width: auto; padding: 10px 18px; font-size: 14px;" onclick={end} disabled={busy}>
					{$_('session.end')}
				</button>
			{/if}
		</div>

		{#if loadError}
			<div class="center">
				<div class="question-block">
					<h2>{$_('session.loadFailed')}</h2>
					<p style="color: var(--accent)">{loadError}</p>
				</div>
			</div>
		{:else if session && ticket}
			<div class="body">
				<aside class="roster">
					<h3>{$_('session.inRoom')} <span class="count">{roster.length}</span></h3>
					<div class="roster-list">
						{#each roster as r (r.id)}
							<div
								class="r-row {r.id === activeMemberId ? 'active' : ''}"
								onclick={() => pickMember(r)}
								onkeydown={(e) => e.key === 'Enter' && pickMember(r)}
								role="button"
								tabindex="0"
							>
								<div class="av">{deriveSig(r.name)}</div>
								<span class="name">{r.name}</span>
								<span class="ticket">{r.groupName}</span>
								<span class="status {r.id === activeMemberId ? 'live' : r.assignedTicketId ? 'done' : ''}"></span>
							</div>
						{/each}
						{#if roster.length === 0}
							<div style="color: var(--muted); padding: 20px 12px; text-align: center; font-size: 13px;">
								{$_('session.rosterEmpty')}
							</div>
						{/if}
					</div>
				</aside>

				<section class="center">
					{#if !activeMember}
						<div class="question-block">
							<h2>{session?.ticket?.subjectName ?? $_('session.subjectFallback')}</h2>
							<div class="qcap">
								{#if session?.status === 'scheduled'}
									{$_('session.capScheduled')}
								{:else if session?.status === 'live' && verbalQuestions.length > 0}
									{$_('session.capLiveVerbal')}
								{:else if session?.status === 'live'}
									{$_('session.capLiveAuto')}
								{:else}
									{$_('session.capFinished')}
								{/if}
							</div>
						</div>

						<div class="sess-stats">
							<div class="sess-stat">
								<div class="k">{$_('session.inRoom')}</div>
								<div class="v">{roster.length}</div>
								<div class="s">{$_('session.withTicket', { values: { n: roster.filter((r) => r.assignedTicketId).length } })}</div>
							</div>
							<div class="sess-stat">
								<div class="k">{$_('session.ticket')}</div>
								<div class="v">{ticket.title}</div>
								<div class="s">{$_('units.questionsAbbr', { values: { n: ticket.questions.length } })}</div>
							</div>
							<div class="sess-stat">
								<div class="k">{$_('session.duration')}</div>
								<div class="v">{session?.ticket?.durationMin ?? '—'}<small> {$_('units.min')}</small></div>
								<div class="s">
									{#if session?.startedAt}
										{$_('session.startedAt', { values: { time: new Intl.DateTimeFormat($locale ?? 'ru', { hour: '2-digit', minute: '2-digit' }).format(new Date(session.startedAt)) } })}
									{:else}
										{$_('session.notStarted')}
									{/if}
								</div>
							</div>
							<div class="sess-stat">
								<div class="k">{$_('session.verbal')}</div>
								<div class="v">{verbalQuestions.length}</div>
								<div class="s">{$_('session.ofQuestions', { values: { n: ticket.questions.length } })}</div>
							</div>
						</div>

						{#if session?.status === 'live' && roster.length > 0}
							<div class="sess-hint">
								<Icon name="user" />
								<span>{$_('session.hintPickStudent')}</span>
							</div>
						{:else if session?.status === 'scheduled' && roster.length === 0}
							<div class="sess-hint">
								<Icon name="copy" />
								<span>{$_('session.hintCopyLinkPre')} <Icon name="copy" size={14} /> {$_('session.hintCopyLinkPost')}</span>
							</div>
						{/if}
					{:else}
						<div class="student-card">
							<div class="av-lg">{deriveSig(activeMember.name)}</div>
							<div class="who">
								<div class="name">{activeMember.name}</div>
								<div class="meta">
									<span><b>{activeMember.groupName}</b></span>
									{#if activeMember.studentNumber}
										<span>·</span>
										<span>{$_('session.studentNumberLabel')} <b>{activeMember.studentNumber}</b></span>
									{/if}
								</div>
							</div>
							{#if activeQuestion && activeQuestion.type === 'verbal'}
								<div class="ticket-pill">{$_('session.verbalPill', { values: { n: Math.round(activeQuestion.time / 60) } })}</div>
							{/if}
							{#if activeMember.assignedTicketId && studentTicket && studentTicket.id === activeMember.assignedTicketId}
								<div class="ticket-pill">{$_('session.studentTicketPill', { values: { title: studentTicket.title } })}</div>
							{/if}
						</div>

						{#if loadingStudentTicket}
							<div class="question-block">
								<h2>{$_('session.loadingStudentTicket')}</h2>
							</div>
						{:else if activeQuestion && activeQuestion.type === 'verbal'}
							<div class="question-block">
								<h2>{activeQuestion.text}</h2>
								<div class="qcap">{$_('session.startTimerHint')}</div>
							</div>

							<div class="timer-stage {verbalStage === 'recording' ? 'recording' : verbalStage === 'finished' ? 'finished' : ''}">
								<div class="timer-state">
									<span class="led"></span>
									{verbalStage === 'recording' ? $_('session.timerRecording') :
									 verbalStage === 'finished' ? $_('session.timerFinished') :
									 $_('session.timerIdle')}
								</div>

								<div class="timer-display">{formatTime(elapsed)}</div>

								<div class="timer-limit {overLimit ? 'warn' : ''}">
									{#if overLimit}
										{$_('session.overLimit')} <b>{formatTime(elapsed - activeQuestion.time)}</b>
									{:else}
										{$_('session.answerLimit')} <b>{formatTime(activeQuestion.time)}</b>
									{/if}
								</div>

								<div class="timer-actions">
									{#if verbalStage === 'idle'}
										<button class="big-btn start" onclick={verbalStart} disabled={session.status !== 'live'}>
											<Icon name="play" /> {$_('session.btnStart')}
										</button>
									{:else if verbalStage === 'recording'}
										<button class="big-btn stop" onclick={verbalStop}>
											<span class="rec-dot"></span> {$_('session.btnStop')}
										</button>
									{:else}
										<button class="big-btn reset" onclick={reset}>
											<Icon name="back" /> {$_('session.btnReset')}
										</button>
										<button class="big-btn start" onclick={verbalStart}>
											<Icon name="play" /> {$_('session.btnAgain')}
										</button>
									{/if}
								</div>
							</div>

							<div class="rating-card">
								<div class="rating-head">
									<h4>{$_('session.ratingTitle')}</h4>
									<div class="score"><b>{score}</b><small> / {activeQuestion.points}</small></div>
								</div>
								<div class="stars">
									{#each Array.from({ length: activeQuestion.points }, (_, i) => i) as i (i)}
										{@const filled = i < score}
										<span
											class="star {filled ? 'on' : ''}"
											onclick={() => (score = i + 1 === score ? i : i + 1)}
											onkeydown={(e) => e.key === 'Enter' && (score = i + 1 === score ? i : i + 1)}
											role="button"
											tabindex="0"
										>
											<svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
												<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>
											</svg>
										</span>
									{/each}
								</div>
								<div class="rating-actions">
									<button
										class="btn primary"
										disabled={verbalStage !== 'finished'}
										onclick={saveGrade}
										style="opacity: {verbalStage === 'finished' ? 1 : 0.4}; cursor: {verbalStage === 'finished' ? 'pointer' : 'not-allowed'};"
									>
										<Icon name="check" /> {$_('session.saveGrade')}
									</button>
									<button class="btn ghost" onclick={() => (activeMemberId = null)}>
										<Icon name="back" /> {$_('session.backToList')}
									</button>
								</div>
							</div>
						{:else if activeQuestion}
							<div class="question-block">
								<h2>{activeQuestion.text}</h2>
								<div class="qcap">{$_('session.autoTestCap')}</div>
							</div>
						{/if}
					{/if}
				</section>

				<aside class="rail">
					<div class="rail-section">
						<h4>{$_('session.verbalQuestions')}</h4>
						{#if verbalQuestions.length === 0}
							<div style="color: var(--muted); font-size: 13px;">{$_('session.noVerbalQuestions')}</div>
						{:else}
							<ul class="rubric-list">
								{#each verbalQuestions as q, i (q.id)}
									<li>
										<button
											type="button"
											onclick={() => (activeQuestionId = q.id)}
											style="display: contents; cursor: pointer; opacity: {q.id === activeQuestionId ? 1 : 0.7}; background: none; border: 0; font: inherit; color: inherit; text-align: left;"
										>
											<span class="ic">{i + 1}</span>
											<span>{q.text.slice(0, 80)}{q.text.length > 80 ? '…' : ''}</span>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rail-section">
						<h4>{$_('session.notes')}</h4>
						<textarea
							class="notes-area"
							placeholder={$_('session.notesPlaceholder')}
							bind:value={notes}
						></textarea>
					</div>
				</aside>
			</div>
		{:else}
			<div class="center">
				<div class="question-block">
					<h2>{$_('session.loadingSession')}</h2>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if toast}
	<div class="toast-overlay" role="status" aria-live="polite">
		<div class="toast-card">
			<div class="toast-icon"><Icon name="check" size={22} stroke={2.4} /></div>
			<div>
				<div class="toast-title">{$_('session.gradeSaved')}</div>
				<div class="toast-sub">{toast.name} · {$_('units.points', { values: { n: toast.score } })} — {$_('session.nextStudent')}</div>
			</div>
		</div>
	</div>
{/if}
