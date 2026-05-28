<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';

	const teacherRoutes = [
		{ href: '/login', label: 'Login', sub: 'Teacher / Admin auth' },
		{ href: '/dashboard', label: 'Dashboard', sub: 'Teacher workspace + exam builder + run sessions' }
	];
	const studentRoutes = [
		{ href: '/student', label: 'Student', sub: 'Paste a session ID, then Join → Wait → Take' }
	];
</script>

<svelte:head>
	<title>Ticketer</title>
	<style>
		body { margin: 0; background: #ECECEC; font-family: 'Geist', ui-sans-serif, system-ui, sans-serif; color: #0A0A0A; }
	</style>
</svelte:head>

<div class="page">
	<header>
		<div class="brand">
			<span class="logo"></span>
			<span class="mark">ticketer<span class="dot">.</span></span>
		</div>
		<h1>University Exam Tickets Platform</h1>
		<p>{auth.user ? `Signed in as ${auth.user.email}` : 'Sign in to start running exams.'}</p>
	</header>

	<section>
		<h2>Teacher</h2>
		<div class="grid">
			{#each teacherRoutes as r (r.href)}
				<a class="card" href={r.href}>
					<div class="label">{r.label}</div>
					<div class="sub">{r.sub}</div>
					<div class="arrow">→</div>
				</a>
			{/each}
		</div>
	</section>

	<section>
		<h2>Student</h2>
		<div class="grid">
			{#each studentRoutes as r (r.href)}
				<a class="card" href={r.href}>
					<div class="label">{r.label}</div>
					<div class="sub">{r.sub}</div>
					<div class="arrow">→</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		min-height: 100vh;
		padding: 48px 24px;
		max-width: 1000px;
		margin: 0 auto;
		display: flex; flex-direction: column; gap: 36px;
	}
	header { display: flex; flex-direction: column; gap: 12px; }
	.brand { display: flex; align-items: center; gap: 12px; }
	.logo {
		width: 36px; height: 36px; border-radius: 10px; background: #0A0A0A; position: relative;
	}
	.logo::after {
		content: ''; position: absolute; inset: 9px; border-radius: 3px; background: #FF4D1F;
	}
	.mark { font-size: 22px; font-weight: 600; letter-spacing: -0.025em; }
	.mark .dot { color: #FF4D1F; }
	h1 { margin: 0; font-size: 36px; font-weight: 600; letter-spacing: -0.03em; }
	h2 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #8A8A8A; text-transform: uppercase; letter-spacing: 0.08em; }
	p { margin: 0; color: #8A8A8A; font-size: 16px; }

	.grid {
		display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
	}
	.card {
		background: #fff; border-radius: 16px; padding: 22px;
		display: grid; grid-template-columns: 1fr auto; align-items: center;
		gap: 8px 16px;
		text-decoration: none; color: inherit;
		transition: transform .15s, box-shadow .15s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, .04);
	}
	.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -8px rgba(0, 0, 0, .15); }
	.label { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
	.sub { grid-column: 1; color: #8A8A8A; font-size: 13.5px; }
	.arrow { grid-row: 1 / span 2; font-size: 20px; color: #8A8A8A; }

	@media (max-width: 700px) {
		.grid { grid-template-columns: 1fr; }
		h1 { font-size: 28px; }
	}
</style>
