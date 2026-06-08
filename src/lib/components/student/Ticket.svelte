<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { Socket } from 'socket.io-client';
	import { connectAsStudent } from '$lib/socket';
	import { sessionsApi, type ApiAssignedTicket } from '$lib/api/sessions';
	import { formatTime } from '$lib/api/adapters';
	import { _ } from 'svelte-i18n';
	import { get } from 'svelte/store';

	export type VerbalStatus = 'waiting' | 'recording' | 'finished';

	interface Props {
		sessionId: string;
		sessionToken: string;
		memberId: string;
		assignedTicket: ApiAssignedTicket;
		onExit: () => void;
	}
	let { sessionId, sessionToken, memberId, assignedTicket, onExit }: Props = $props();

	let currentIdx = $state(0);
	// answers keyed by questionId
	let selected = $state<Record<string, number>>({});
	let textAnswers = $state<Record<string, string>>({});
	let numericAnswers = $state<Record<string, number>>({});

	let verbalStatus = $state<VerbalStatus>('waiting');
	let verbalElapsed = $state(0);
	let timeLeft = $state(0);

	let sock: Socket | null = null;

	let question = $derived(assignedTicket.questions[currentIdx]);
	let isVerbal = $derived(question?.type === 'verbal');
	let timeWarn = $derived(!isVerbal && timeLeft <= 15);

	$effect(() => {
		if (!question) return;
		timeLeft = question.time;
		verbalElapsed = 0;
	});

	$effect(() => {
		if (isVerbal) {
			if (verbalStatus !== 'recording') return;
			const t = setInterval(() => (verbalElapsed += 1), 1000);
			return () => clearInterval(t);
		}
		const t = setInterval(() => (timeLeft = Math.max(0, timeLeft - 1)), 1000);
		return () => clearInterval(t);
	});

	$effect(() => {
		sock = connectAsStudent(sessionId, sessionToken);
		sock.on('verbal:status', (payload: { memberId: string; questionId: string; stage: VerbalStatus; durationSec?: number }) => {
			if (payload.memberId === memberId && payload.questionId === question?.id) {
				verbalStatus = payload.stage;
				if (payload.durationSec != null) verbalElapsed = payload.durationSec;
			}
		});
		sock.on('session:end', () => {
			alert(get(_)('studentTicket.examEnded'));
			onExit();
		});
		return () => sock?.disconnect();
	});

	async function persistCurrentAnswer() {
		if (!question || isVerbal) return;
		const item: {
			questionId: string;
			selectedIndex?: number;
			textValue?: string;
			numericValue?: number;
		} = { questionId: question.id };
		if (question.type === 'single') {
			if (selected[question.id] == null) return;
			item.selectedIndex = selected[question.id];
		} else if (question.type === 'text') {
			if (!textAnswers[question.id]) return;
			item.textValue = textAnswers[question.id];
		} else if (question.type === 'numeric') {
			if (numericAnswers[question.id] == null) return;
			item.numericValue = numericAnswers[question.id];
		}
		try {
			await sessionsApi.submitAnswers(sessionId, [item]);
		} catch (err) {
			console.error('submit answer failed', err);
		}
	}

	async function goNext() {
		await persistCurrentAnswer();
		currentIdx = Math.min(assignedTicket.totalQuestions - 1, currentIdx + 1);
	}

	function goPrev() {
		currentIdx = Math.max(0, currentIdx - 1);
	}
</script>

<div class="top">
	<div class="title">
		{assignedTicket.title}
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
			onclick={onExit}
			onkeydown={(e) => e.key === 'Enter' && onExit()}
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
			<div class="opts-head no-border">{$_('studentTicket.chooseOption')}</div>
			<div class="opts">
				{#each question.answers as o, i (i)}
					{@const isSel = selected[question.id] === i}
					<div
						class="opt {isSel ? 'sel' : ''}"
						onclick={() => (selected = { ...selected, [question.id]: i })}
						onkeydown={(e) => e.key === 'Enter' && (selected = { ...selected, [question.id]: i })}
						role="button"
						tabindex="0"
					>
						<div class="r"></div>
						<div>{o}</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if question.type === 'text'}
		<div class="opts-pane">
			<div class="opts-head no-border">{$_('studentTicket.enterAnswer')}</div>
			<input
				bind:value={textAnswers[question.id]}
				placeholder={$_('studentTicket.yourAnswer')}
				style="background: var(--field-2); border-radius: 14px; padding: 16px 18px; border: 1.5px solid transparent; font: inherit; font-size: 15.5px; color: var(--ink); outline: none;"
			/>
		</div>
	{:else if question.type === 'numeric'}
		<div class="opts-pane">
			<div class="opts-head no-border">{$_('studentTicket.enterNumeric')}</div>
			<input
				type="number"
				bind:value={numericAnswers[question.id]}
				placeholder="0"
				style="background: var(--field-2); border-radius: 14px; padding: 16px 18px; border: 1.5px solid transparent; font: inherit; font-size: 15.5px; color: var(--ink); outline: none;"
			/>
		</div>
	{/if}
</div>

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
