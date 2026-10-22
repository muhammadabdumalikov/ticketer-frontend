<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { connectAsStudent } from '$lib/socket';
	import { sessionsApi, type AnswerItem, type ApiAssignedTicket, type ApiMyAnswer } from '$lib/api/sessions';
	import { errorCode, isUnauthorized } from '$lib/api/client';
	import { formatTime } from '$lib/api/adapters';
	import { _ } from 'svelte-i18n';
	import { ticketTitle } from '$lib/i18n/format';
	import { get } from 'svelte/store';

	export type VerbalStatus = 'waiting' | 'recording' | 'finished';

	interface Props {
		sessionId: string;
		sessionToken: string;
		memberId: string;
		assignedTicket: ApiAssignedTicket;
		onExit: () => void;
		onSessionLost: () => void;
	}
	let { sessionId, sessionToken, memberId, assignedTicket, onExit, onSessionLost }: Props = $props();

	type VerbalState = { stage: VerbalStatus; startedAtMs?: number; durationSec?: number };

	let currentIdx = $state(0);
	// answers keyed by questionId
	let selected = $state<Record<string, number>>({});
	let textAnswers = $state<Record<string, string>>({});
	let numericAnswers = $state<Record<string, number>>({});
	let multiAnswers = $state<Record<string, number[]>>({});
	// verbal progress per question, as reported by the proctor
	let verbal = $state<Record<string, VerbalState>>({});
	// answers the server has not accepted yet; retried on reconnect and resync
	let unsaved = $state.raw<Record<string, AnswerItem>>({});

	// Seconds left per auto-checked question. Kept in localStorage so neither a
	// reload nor going back to a question restarts its clock.
	let remaining = $state<Record<string, number>>({});
	let now = $state(Date.now());
	let ended = false;
	// the exam's overall time ran out: written answers are closed, verbal still goes on
	let timeOver = $state(false);

	let question = $derived(assignedTicket.questions[currentIdx]);
	let isVerbal = $derived(question?.type === 'verbal');
	let timeLeft = $derived(question ? (remaining[question.id] ?? question.time) : 0);
	let expired = $derived(!!question && !isVerbal && (timeLeft <= 0 || timeOver));
	let timeWarn = $derived(!isVerbal && timeLeft <= 15);
	let hasUnsaved = $derived(Object.keys(unsaved).length > 0);
	let verbalStatus = $derived<VerbalStatus>((question && verbal[question.id]?.stage) || 'waiting');
	let verbalElapsed = $derived.by(() => {
		const v = question ? verbal[question.id] : undefined;
		if (v?.stage === 'recording' && v.startedAtMs != null) {
			return Math.max(0, Math.round((now - v.startedAtMs) / 1000));
		}
		return v?.durationSec ?? 0;
	});

	const timersKey = () => `ticketer_timers:${sessionId}:${memberId}`;

	onMount(() => {
		try {
			const raw = localStorage.getItem(timersKey());
			if (raw) remaining = JSON.parse(raw) as Record<string, number>;
		} catch {
			// no stored timers — every question starts with its full time
		}
	});

	function saveTimers() {
		try {
			localStorage.setItem(timersKey(), JSON.stringify(remaining));
		} catch {
			// storage unavailable; timers still run for this page
		}
	}

	$effect(() => {
		if (isVerbal) {
			if (verbalStatus !== 'recording') return;
			const t = setInterval(() => (now = Date.now()), 1000);
			return () => clearInterval(t);
		}
		if (!question || expired) return;
		const { id: qid, time: full } = question;
		const t = setInterval(() => {
			remaining[qid] = Math.max(0, (remaining[qid] ?? full) - 1);
			saveTimers();
		}, 1000);
		return () => clearInterval(t);
	});

	// Time is up: keep what was answered and move on. Revisiting an expired
	// question skips forward the same way; the last one just stays locked.
	$effect(() => {
		if (!expired) return;
		untrack(() => void onTimeUp());
	});

	async function onTimeUp() {
		await persistCurrentAnswer();
		if (currentIdx < assignedTicket.totalQuestions - 1) currentIdx += 1;
	}

	function pickSingle(qid: string, i: number) {
		if (expired) return;
		selected = { ...selected, [qid]: i };
	}

	function toggleMulti(qid: string, i: number) {
		if (expired) return;
		const cur = multiAnswers[qid] ?? [];
		multiAnswers = {
			...multiAnswers,
			[qid]: cur.includes(i) ? cur.filter((j) => j !== i) : [...cur, i].sort((a, b) => a - b)
		};
	}

	$effect(() => {
		const { sock, close } = connectAsStudent(sessionId, sessionToken, onSessionLost);
		// Runs on the first connect and on every reconnect: events sent while
		// the socket was down are not replayed, so re-read our state.
		sock.on('connect', () => void resync());
		sock.on('verbal:status', (payload: { memberId: string; questionId: string; stage: VerbalStatus; durationSec?: number }) => {
			if (payload.memberId !== memberId) return;
			verbal = {
				...verbal,
				[payload.questionId]:
					payload.stage === 'recording'
						? { stage: 'recording', startedAtMs: Date.now() }
						: { stage: payload.stage, durationSec: payload.durationSec }
			};
			now = Date.now();
		});
		sock.on('session:end', handleEnded);
		// Fallback for networks where the socket cannot connect at all.
		const poll = setInterval(() => void resync(), 15000);
		return () => {
			clearInterval(poll);
			close();
		};
	});

	function verbalFromAnswer(a: ApiMyAnswer): VerbalState | null {
		if (a.endedAt) return { stage: 'finished', durationSec: a.durationSec ?? 0 };
		if (a.startedAt) return { stage: 'recording', startedAtMs: new Date(a.startedAt).getTime() };
		return null;
	}

	async function resync() {
		try {
			const me = await sessionsApi.me(sessionId, sessionToken);
			if (me.session.status === 'finished') {
				handleEnded();
				return;
			}
			const nextVerbal: Record<string, VerbalState> = {};
			for (const a of me.answers) {
				const v = verbalFromAnswer(a);
				if (v) nextVerbal[a.questionId] = v;
				// Restore saved answers, never overwriting what the student typed here.
				if (a.selectedIndex != null && selected[a.questionId] === undefined) {
					selected[a.questionId] = a.selectedIndex;
				}
				if (a.selectedIndices != null && multiAnswers[a.questionId] === undefined) {
					multiAnswers[a.questionId] = a.selectedIndices;
				}
				if (a.textValue != null && textAnswers[a.questionId] === undefined) {
					textAnswers[a.questionId] = a.textValue;
				}
				if (a.numericValue != null && numericAnswers[a.questionId] === undefined) {
					numericAnswers[a.questionId] = a.numericValue;
				}
			}
			verbal = nextVerbal;
			now = Date.now();
			await flushUnsaved();
		} catch (err) {
			if (isUnauthorized(err)) onSessionLost();
		}
	}

	function currentAnswerItem(): AnswerItem | null {
		if (!question || isVerbal) return null;
		const item: AnswerItem = { questionId: question.id };
		if (question.type === 'single') {
			if (selected[question.id] == null) return null;
			item.selectedIndex = selected[question.id];
		} else if (question.type === 'multi') {
			if (multiAnswers[question.id] == null) return null;
			item.selectedIndices = [...multiAnswers[question.id]];
		} else if (question.type === 'text') {
			if (!textAnswers[question.id]) return null;
			item.textValue = textAnswers[question.id];
		} else if (question.type === 'numeric') {
			if (numericAnswers[question.id] == null) return null;
			item.numericValue = numericAnswers[question.id];
		}
		return item;
	}

	// Send answers; whatever fails stays in `unsaved` for the next attempt.
	async function submit(items: AnswerItem[]) {
		if (items.length === 0) return;
		unsaved = { ...unsaved, ...Object.fromEntries(items.map((i) => [i.questionId, i])) };
		try {
			await sessionsApi.submitAnswers(sessionId, items, sessionToken);
			const sent = new Set(items);
			unsaved = Object.fromEntries(Object.entries(unsaved).filter(([, v]) => !sent.has(v)));
		} catch (err) {
			if (isUnauthorized(err)) onSessionLost();
			else if (errorCode(err) === 'exam_closed') {
				// the server will never take these — the session is over
				unsaved = {};
				handleEnded();
			} else if (errorCode(err) === 'time_over') {
				unsaved = {};
				timeOver = true;
			}
		}
	}

	async function persistCurrentAnswer() {
		const item = currentAnswerItem();
		if (item) await submit([item]);
	}

	async function flushUnsaved() {
		await submit(Object.values(unsaved));
	}

	function handleEnded() {
		if (ended) return;
		ended = true;
		try {
			localStorage.removeItem(timersKey());
		} catch {
			// ignore
		}
		alert(get(_)('studentTicket.examEnded'));
		onExit();
	}

	async function exitExam() {
		const message = hasUnsaved ? 'studentTicket.confirmExitUnsaved' : 'studentTicket.confirmExit';
		if (!confirm(get(_)(message))) return;
		await persistCurrentAnswer();
		onExit();
	}

	async function goNext() {
		await persistCurrentAnswer();
		currentIdx = Math.min(assignedTicket.totalQuestions - 1, currentIdx + 1);
	}

	async function goPrev() {
		await persistCurrentAnswer();
		currentIdx = Math.max(0, currentIdx - 1);
	}
</script>

<div class="top">
	<div class="title">
		{$ticketTitle(assignedTicket.title)}
		<span class="info" title={$_('studentTicket.ticketInfo')}>i</span>
	</div>
	<div class="spacer"></div>
	<div class="pill-time {timeWarn ? 'warn' : ''} {isVerbal && verbalStatus === 'recording' ? 'rec' : ''}">
		{#if isVerbal}
			{#if verbalStatus === 'recording'}
				<span class="rec-dot"></span> {formatTime(verbalElapsed)}
			{:else if verbalStatus === 'finished'}
				<Icon name="check" /> {formatTime(verbalElapsed)}
			{:else}
				<Icon name="mic" /> {$_('studentTicket.statusWaiting')}
			{/if}
		{:else}
			<Icon name="clock" /> {formatTime(timeLeft)}
		{/if}
	</div>
	<div class="tools">
		<div
			class="tool danger"
			title={$_('studentTicket.finishAndExit')}
			onclick={exitExam}
			onkeydown={(e) => e.key === 'Enter' && exitExam()}
			role="button"
			tabindex="0"
		><Icon name="exit" /></div>
	</div>
</div>

<div class="ticket-body">
	<div class="passage">
		<h2>{$_('studentTicket.questionNum', { values: { n: currentIdx + 1 } })}</h2>
		<div class="pcap">{isVerbal ? $_('studentTicket.capVerbal') : $_('studentTicket.capAuto')}</div>
		<p>{question.text}</p>
	</div>

	<div class="vsep">
		<span class="grip"><Icon name="dots" /></span>
	</div>

	{#if isVerbal}
		<div class="opts-pane verbal-pane">
			<div class="verbal-status" data-state={verbalStatus}>
				<div class="verbal-mic">
					{#if verbalStatus === 'recording'}<span class="verbal-ring"></span>{/if}
					<Icon name="mic" />
				</div>
				<div class="verbal-state-label">
					{verbalStatus === 'recording' ? $_('studentTicket.verbalRecording') :
					 verbalStatus === 'finished' ? $_('studentTicket.verbalFinished') :
					 $_('studentTicket.verbalReady')}
				</div>
				<div class="verbal-state-sub">
					{#if verbalStatus === 'recording'}
						{$_('studentTicket.verbalSubRecording')}
					{:else if verbalStatus === 'finished'}
						{$_('studentTicket.verbalSubFinished')}
					{:else}
						{$_('studentTicket.verbalSubReady', { values: { n: Math.round(question.time / 60) } })}
					{/if}
				</div>
			</div>

			<div class="verbal-meta">
				<div>
					<div class="k">{$_('studentTicket.limit')}</div>
					<div class="v">{$_('studentTicket.upToMin', { values: { n: Math.round(question.time / 60) } })}</div>
				</div>
				<div>
					<div class="k">{$_('studentTicket.maxPoints')}</div>
					<div class="v">{question.points}</div>
				</div>
			</div>
		</div>
	{:else if question.type === 'single' && question.answers}
		<div class="opts-pane">
			<div class="opts-head no-border">{expired ? $_('studentTicket.timeUp') : $_('studentTicket.chooseOption')}</div>
			<div class="opts">
				{#each question.answers as o, i (i)}
					{@const isSel = selected[question.id] === i}
					<div
						class="opt {isSel ? 'sel' : ''} {expired ? 'locked' : ''}"
						onclick={() => pickSingle(question.id, i)}
						onkeydown={(e) => e.key === 'Enter' && pickSingle(question.id, i)}
						role="radio"
						aria-checked={isSel}
						aria-disabled={expired}
						tabindex="0"
					>
						<div class="r"></div>
						<div>{o}</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if question.type === 'multi' && question.answers}
		<div class="opts-pane">
			<div class="opts-head no-border">{expired ? $_('studentTicket.timeUp') : $_('studentTicket.chooseOptions')}</div>
			<div class="opts">
				{#each question.answers as o, i (i)}
					{@const isSel = multiAnswers[question.id]?.includes(i) ?? false}
					<div
						class="opt {isSel ? 'sel' : ''} {expired ? 'locked' : ''}"
						onclick={() => toggleMulti(question.id, i)}
						onkeydown={(e) => e.key === 'Enter' && toggleMulti(question.id, i)}
						role="checkbox"
						aria-checked={isSel}
						aria-disabled={expired}
						tabindex="0"
					>
						<div class="r check"></div>
						<div>{o}</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if question.type === 'text'}
		<div class="opts-pane">
			<div class="opts-head no-border">{expired ? $_('studentTicket.timeUp') : $_('studentTicket.enterAnswer')}</div>
			<input
				bind:value={textAnswers[question.id]}
				disabled={expired}
				placeholder={$_('studentTicket.yourAnswer')}
				style="background: var(--field-2); border-radius: 14px; padding: 16px 18px; border: 1.5px solid transparent; font: inherit; font-size: 15.5px; color: var(--ink); outline: none;"
			/>
		</div>
	{:else if question.type === 'numeric'}
		<div class="opts-pane">
			<div class="opts-head no-border">{expired ? $_('studentTicket.timeUp') : $_('studentTicket.enterNumeric')}</div>
			<input
				type="number"
				bind:value={numericAnswers[question.id]}
				disabled={expired}
				placeholder="0"
				style="background: var(--field-2); border-radius: 14px; padding: 16px 18px; border: 1.5px solid transparent; font: inherit; font-size: 15.5px; color: var(--ink); outline: none;"
			/>
		</div>
	{/if}
</div>

{#if timeOver}
	<div style="margin: 0 24px 12px; background: var(--field-2); color: var(--ink); padding: 10px 14px; border-radius: 12px; font-size: 13.5px;">
		{$_('studentTicket.examTimeOver')}
	</div>
{/if}

{#if hasUnsaved}
	<div style="margin: 0 24px 12px; background: var(--accent-soft); color: var(--accent); padding: 10px 14px; border-radius: 12px; font-size: 13.5px;">
		{$_('studentTicket.saveFailed')}
	</div>
{/if}

<div class="foot">
	<div class="help" title={$_('studentTicket.help')}>?</div>
	<div class="pager" role="button" tabindex="0">
		{$_('studentTicket.pager', { values: { n: currentIdx + 1, total: assignedTicket.totalQuestions } })}
		<span class="ch"><Icon name="down" /></span>
	</div>
	<div class="nav">
		<button class="btn btn-outline" onclick={goPrev} disabled={currentIdx === 0}>
			{$_('common.back')}
		</button>
		<button class="btn btn-primary" onclick={goNext}>
			{currentIdx === assignedTicket.totalQuestions - 1 ? $_('studentTicket.finish') : $_('common.next')}
		</button>
	</div>
</div>
