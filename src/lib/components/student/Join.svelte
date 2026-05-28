<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

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
		Сессия открыта
	</div>
</div>

<div class="join-body">
	<div class="join-left">
		<div class="wait-eyebrow">
			<span class="pulse"></span>
			ВЫ ПРИГЛАШЕНЫ НА ЭКЗАМЕН
		</div>

		<h1 class="wait-headline">
			{examInfo?.subject ?? 'Экзамен'}.<br />
			<em>Войдите в комнату, чтобы начать.</em>
		</h1>

		<p class="wait-sub">
			Введите ваше имя и группу — преподаватель увидит, что вы подключились.
			Сразу после входа вы попадёте в комнату ожидания. Когда все будут готовы,
			преподаватель запустит сессию и вам выпадет билет.
		</p>

		{#if examInfo}
			<div class="wait-meta">
				<div class="it">
					<div class="k">Преподаватель</div>
					<div class="v">{examInfo.teacher}</div>
				</div>
				<div class="it">
					<div class="k">Код</div>
					<div class="v">{examInfo.code}</div>
				</div>
				<div class="it">
					<div class="k">Длительность</div>
					<div class="v">{examInfo.duration}<small> мин на билет</small></div>
				</div>
			</div>
		{/if}
	</div>

	<form class="join-right" onsubmit={submit}>
		<div class="join-card-head">
			<h3>Вход в сессию</h3>
			<p>Эти данные увидят только преподаватель и комиссия.</p>
		</div>

		{#if !hasSession}
			<div class="j-field">
				<label for="j-session">Код / ID сессии</label>
				<input
					id="j-session"
					bind:value={sessionCode}
					placeholder="вставьте UUID сессии"
					autocomplete="off"
				/>
			</div>
		{/if}

		<div class="j-field">
			<label for="j-name">Фамилия и имя</label>
			<input
				id="j-name"
				bind:value={name}
				placeholder="напр. Михаил Соколов"
				autocomplete="name"
			/>
		</div>

		<div class="join-row">
			<div class="j-field">
				<label for="j-group">Группа</label>
				<input
					id="j-group"
					bind:value={group}
					placeholder="ИВТ-301"
					autocomplete="off"
				/>
			</div>
			<div class="j-field">
				<label for="j-id">№ зачётки <span class="m-hint">(не обязательно)</span></label>
				<input
					id="j-id"
					bind:value={studentNumber}
					placeholder="например 23-1284"
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
				Я подтверждаю, что готов сдавать экзамен самостоятельно и не использую
				запрещённые материалы.
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
			{busy ? 'Подключение…' : 'Войти в комнату'} <Icon name="arrow" />
		</button>

		<div class="j-foot">
			<Icon name="shield" /> Защищённая сессия · Все действия логируются
		</div>
	</form>
</div>
