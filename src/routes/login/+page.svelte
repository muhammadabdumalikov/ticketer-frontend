<script lang="ts">
	import '$lib/styles/login.css';
	import BrandPane from '$lib/components/login/BrandPane.svelte';
	import FormPane from '$lib/components/login/FormPane.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		document.body.classList.add('page-login');
		return () => document.body.classList.remove('page-login');
	});
</script>

<svelte:head><title>Ticketer — Вход</title></svelte:head>

<div class="stage">
	<div class="frame split">
		<BrandPane headline="ticket" />
		<FormPane />
	</div>
</div>
