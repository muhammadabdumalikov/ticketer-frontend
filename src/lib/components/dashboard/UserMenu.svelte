<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { auth, type PublicUser } from '$lib/stores/auth.svelte';

	let open = $state(false);
	let confirming = $state(false);
	let root: HTMLDivElement | undefined = $state();

	let user = $derived<PublicUser | null>(auth.user);

	let initials = $derived(getInitials(user?.name));
	let roleLabel = $derived(formatRole(user?.role));

	function getInitials(name: string | null | undefined): string {
		if (!name) return '—';
		const cleaned = name.replace(/^(Д-р|Dr\.?|Prof\.?|Проф\.?)\s+/i, '');
		const parts = cleaned.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return '—';
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	function formatRole(role: string | null | undefined): string {
		switch (role) {
			case 'teacher':
				return 'Преподаватель';
			case 'admin':
				return 'Администратор';
			default:
				return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
		}
	}

	function toggle() {
		open = !open;
		if (!open) confirming = false;
	}

	function close() {
		open = false;
		confirming = false;
	}

	function onDocClick(e: MouseEvent) {
		if (root && !root.contains(e.target as Node)) close();
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	$effect(() => {
		if (!open) return;
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	});

	function handleLogout() {
		auth.logout();
		close();
		void goto('/login');
	}
</script>

<div class="user-menu" bind:this={root}>
	{#if open}
		<div class="um-pop" role="menu">
			<div class="um-head">
				<div class="um-avatar">{initials}</div>
				<div class="um-id">
					<div class="um-name">{user?.name ?? 'Без имени'}</div>
					<div class="um-email">{user?.email ?? ''}</div>
				</div>
			</div>
			{#if roleLabel || user?.department}
				<div class="um-meta">
					{#if roleLabel}<span class="um-chip">{roleLabel}</span>{/if}
					{#if user?.department}<span class="um-chip um-chip-muted">{user.department}</span>{/if}
				</div>
			{/if}

			<div class="um-sep"></div>

			{#if !confirming}
				<button
					type="button"
					class="um-item um-item-danger"
					onclick={() => (confirming = true)}
					role="menuitem"
				>
					<span class="um-item-ic"><Icon name="exit" /></span>
					<span>Выйти из аккаунта</span>
				</button>
			{:else}
				<div class="um-confirm">
					<div class="um-confirm-text">Выйти из аккаунта?</div>
					<div class="um-confirm-row">
						<button type="button" class="um-btn um-btn-ghost" onclick={() => (confirming = false)}>
							Отмена
						</button>
						<button type="button" class="um-btn um-btn-danger" onclick={handleLogout}>
							Выйти
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		class="sb-user sb-user-btn {open ? 'open' : ''}"
		onclick={toggle}
		aria-haspopup="menu"
		aria-expanded={open}
	>
		<div class="avatar">{initials}</div>
		<div class="who">
			<div class="name">{user?.name ?? 'Гость'}</div>
			<div class="role">{roleLabel || user?.department || ''}</div>
		</div>
		<span class="more"><Icon name="more" /></span>
	</button>
</div>
