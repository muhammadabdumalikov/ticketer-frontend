<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { _ } from 'svelte-i18n';

	export interface ExamMeta {
		subject: string;
		code: string;
		date: string;
		duration: number;
		teacher: string;
	}

	export interface JoinPayload {
		name: string;
		group: string;
		studentNumber: string;
		sessionId: string;
	}

	interface Props {
		examInfo?: ExamMeta | null;
		hasSession: boolean;
		busy?: boolean;
		errorMessage?: string;
		onJoin: (p: JoinPayload) => void;
	}
	let { examInfo, hasSession, busy = false, errorMessage = '', onJoin }: Props = $props();

	let name = $state('');
	let group = $state('');
	let studentNumber = $state('');
	let ready = $state(false);
	let sessionCode = $state('');

	let valid = $derived(
		name.trim().length >= 3 &&
			group.trim().length >= 2 &&
			(hasSession || /^[0-9a-fA-F-]{30,40}$/.test(sessionCode.trim()))
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid || busy) return;
		onJoin({
			name: name.trim(),
			group: group.trim(),
			studentNumber: studentNumber.trim(),
			sessionId: hasSession ? '' : sessionCode.trim()
		});
	}
</script>

<div class="top">
	<div class="title">
		<span class="logo-mini">
			<span class="logo-dot"></span>
		</span>
		ticketer<span style="color: var(--accent);">.</span>
	</div>
	<div class="spacer"></div>
	<div class="pill-time">
		<span style="width: 8px; height: 8px; border-radius: 999px; background: var(--green); display: inline-block;"></span>
		{$_('join.pill')}
	</div>
</div>

<div class="join-body">
	<div class="join-left">
		<div class="wait-eyebrow">
			<span class="pulse"></span>
			{$_('join.eyebrow')}
		</div>

		<h1 class="wait-headline">
			{examInfo?.subject ?? $_('join.subjectFallback')}.<br />
			<em>{$_('join.headlineEnter')}</em>
		</h1>

		<p class="wait-sub">
			{$_('join.subtitle')}
		</p>

		{#if examInfo}
			<div class="wait-meta">
				<div class="it">
					<div class="k">{$_('join.metaTeacher')}</div>
					<div class="v">{examInfo.teacher}</div>
				</div>
				<div class="it">
					<div class="k">{$_('join.metaCode')}</div>
					<div class="v">{examInfo.code}</div>
				</div>
				<div class="it">
					<div class="k">{$_('join.metaDuration')}</div>
					<div class="v">{examInfo.duration}<small> {$_('join.minPerTicket')}</small></div>
				</div>
			</div>
		{/if}
	</div>

	<form class="join-right" onsubmit={submit}>
		<div class="join-card-head">
			<h3>{$_('join.formHeading')}</h3>
			<p>{$_('join.formDesc')}</p>
		</div>

		{#if !hasSession}
			<div class="j-field">
				<label for="j-session">{$_('join.fieldSession')}</label>
				<input
					id="j-session"
					bind:value={sessionCode}
					placeholder={$_('join.placeholderSession')}
					autocomplete="off"
				/>
			</div>
		{/if}

		<div class="j-field">
			<label for="j-name">{$_('join.fieldName')}</label>
			<input
				id="j-name"
				bind:value={name}
				placeholder={$_('join.placeholderName')}
				autocomplete="name"
			/>
		</div>

		<div class="join-row">
			<div class="j-field">
				<label for="j-group">{$_('join.fieldGroup')}</label>
				<input
					id="j-group"
					bind:value={group}
					placeholder={$_('join.placeholderGroup')}
					autocomplete="off"
				/>
			</div>
			<div class="j-field">
				<label for="j-id">{$_('join.fieldStudentNumber')} <span class="m-hint">{$_('join.optional')}</span></label>
				<input
					id="j-id"
					bind:value={studentNumber}
					placeholder={$_('join.placeholderStudentNumber')}
					autocomplete="off"
				/>
			</div>
		</div>

		<div
			class="j-check"
			onclick={() => (ready = !ready)}
			onkeydown={(e) => e.key === 'Enter' && (ready = !ready)}
			role="checkbox"
			aria-checked={ready}
			tabindex="0"
		>
			<span class="j-box {ready ? 'on' : ''}">{#if ready}<Icon name="check" />{/if}</span>
			<span>
				{$_('join.consent')}
			</span>
		</div>

		{#if errorMessage}
			<div style="background: var(--accent-soft); color: var(--accent); padding: 10px 14px; border-radius: 12px; font-size: 13.5px;">
				{errorMessage}
			</div>
		{/if}

		<button
			type="submit"
			class="btn btn-primary btn-lg"
			disabled={!valid || !ready || busy}
			style="width: 100%; opacity: {(valid && ready && !busy) ? 1 : 0.45}; cursor: {(valid && ready && !busy) ? 'pointer' : 'not-allowed'};"
		>
			{busy ? $_('join.connecting') : $_('join.enterRoom')} <Icon name="arrow" />
		</button>

		<div class="j-foot">
			<Icon name="shield" /> {$_('join.footer')}
		</div>
	</form>
</div>
