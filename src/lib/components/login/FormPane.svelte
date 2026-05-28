<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { ApiError } from '$lib/api/client';

	let role = $state<'teacher' | 'admin'>('teacher');
	let email = $state('teacher@example.com');
	let password = $state('password');
	let showPw = $state(false);
	let remember = $state(true);
	let loading = $state(false);
	let error = $state('');
	let formEl: HTMLFormElement | undefined = $state();

	let valid = $derived(/\S+@\S+\.\S+/.test(email) && password.length >= 6);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!valid) {
			error = 'Введите корректную почту и пароль (минимум 6 символов).';
			if (formEl) {
				formEl.classList.remove('shake');
				void formEl.offsetWidth;
				formEl.classList.add('shake');
			}
			return;
		}
		loading = true;
		try {
			await auth.login(email, password);
			goto('/dashboard');
		} catch (err) {
			error =
				err instanceof ApiError
					? err.status === 401
						? 'Неверная почта или пароль.'
						: err.message
					: 'Не удалось войти. Попробуйте позже.';
			if (formEl) {
				formEl.classList.remove('shake');
				void formEl.offsetWidth;
				formEl.classList.add('shake');
			}
		} finally {
			loading = false;
		}
	}
</script>

<section class="form-pane">
	<div class="topline">
		<span>Новый пользователь? <a href="#req" onclick={(e) => e.preventDefault()}>Запросить доступ преподавателя</a></span>
		<span style="display:flex; align-items:center; gap:6px; font-size:13px;">
			<Icon name="shield" /> SSO + 2FA доступны
		</span>
	</div>

	<div class="formhead">
		<h2>С возвращением.</h2>
		<p>Войдите, чтобы управлять билетами, банками вопросов и сессиями.</p>
	</div>

	<div class="tabs" role="tablist" aria-label="Account role">
		<button
			type="button"
			role="tab"
			aria-selected={role === 'teacher'}
			class={role === 'teacher' ? 'active' : ''}
			onclick={() => (role = 'teacher')}
		>
			<span class="dot-s"></span>
			<Icon name="gradCap" />
			Преподаватель
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={role === 'admin'}
			class={role === 'admin' ? 'active' : ''}
			onclick={() => (role = 'admin')}
		>
			<span class="dot-s"></span>
			<Icon name="user" />
			Администратор кафедры
		</button>
	</div>

	<form bind:this={formEl} onsubmit={submit} style="display:flex; flex-direction:column; gap:18px;">
		<div class="field">
			<label for="email">Университетская почта</label>
			<div class="control">
				<span class="lead"><Icon name="mail" /></span>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="name@university.edu"
					autocomplete="email"
				/>
			</div>
		</div>

		<div class="field">
			<label for="pw">
				Пароль
				<span class="hint">минимум 6 символов</span>
			</label>
			<div class="control">
				<span class="lead"><Icon name="lock" /></span>
				<input
					id="pw"
					type={showPw ? 'text' : 'password'}
					bind:value={password}
					placeholder="••••••••••"
					autocomplete="current-password"
				/>
				<span
					class="trail"
					onclick={() => (showPw = !showPw)}
					onkeydown={(e) => e.key === 'Enter' && (showPw = !showPw)}
					title={showPw ? 'Скрыть' : 'Показать'}
					role="button"
					tabindex="0"
				>
					{#if showPw}<Icon name="eyeOff" />{:else}<Icon name="eye" />{/if}
				</span>
			</div>
		</div>

		<div class="check-row">
			<div
				class="check {remember ? 'on' : ''}"
				onclick={() => (remember = !remember)}
				onkeydown={(e) => e.key === 'Enter' && (remember = !remember)}
				role="checkbox"
				aria-checked={remember}
				tabindex="0"
			>
				<div class="box"><Icon name="check" size={11} stroke={3.5} /></div>
				Запомнить меня на этом устройстве
			</div>
			<a href="#forgot" class="forgot" onclick={(e) => e.preventDefault()}>Забыли пароль?</a>
		</div>

		{#if error}
			<div class="err-banner" role="alert">
				<Icon name="triangle" />
				<span>{error}</span>
			</div>
		{/if}

		<button
			type="submit"
			class="btn btn-primary"
			style="width: 100%; padding: 18px 22px; font-size: 15.5px;"
			disabled={loading}
		>
			{#if loading}
				<span class="spin"><Icon name="loader" /></span>
				Проверка данных…
			{:else}
				Войти в Ticketer
				<Icon name="arrow" />
			{/if}
		</button>

		<div class="divider">или войти через</div>
		<div class="sso">
			<button type="button" class="btn btn-ghost">
				<Icon name="google" size={18} />
				Google Workspace
			</button>
			<button type="button" class="btn btn-ghost">
				<Icon name="ms" />
				Microsoft EDU
			</button>
		</div>
	</form>

	<div class="foot">
		<span class="status"><span class="led"></span>Все системы работают</span>
		<span style="display:flex; gap:16px;">
			<a href="#privacy" onclick={(e) => e.preventDefault()}>Конфиденциальность</a>
			<a href="#terms" onclick={(e) => e.preventDefault()}>Условия</a>
			<a href="#ver" onclick={(e) => e.preventDefault()}>v2.4.1</a>
		</span>
	</div>
</section>
