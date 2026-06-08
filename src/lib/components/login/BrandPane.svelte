<script lang="ts">
	import { _ } from 'svelte-i18n';
	type Headline = 'ticket' | 'secure' | 'fair';
	interface Props { headline?: Headline; }
	let { headline = 'ticket' }: Props = $props();
</script>

<aside class="brand">
	<div class="row">
		<div class="logo" aria-hidden="true"></div>
		<div class="wordmark">ticketer<span>.</span></div>
	</div>

	<h1>
		{#if headline === 'secure'}
			{$_('brand.headlineSecureLead')} <em>{$_('brand.headlineSecureEm')}</em>
		{:else if headline === 'fair'}
			{$_('brand.headlineFairLead')} <em>{$_('brand.headlineFairEm')}</em>
		{:else}
			{$_('brand.headlineTicketLead')} <em>{$_('brand.headlineTicketEm')}</em>
		{/if}
	</h1>
	<p class="sub">
		{$_('brand.sub')}
	</p>

	<div class="spec">
		<div class="label">{$_('brand.todayLabel')}</div>
		<div class="item">
			<div class="num">01</div>
			<div class="it"><b>{$_('brand.item1Title')}</b><br/><span>{$_('brand.item1Meta')}</span></div>
		</div>
		<div class="item">
			<div class="num">02</div>
			<div class="it"><b>{$_('brand.item2Title')}</b><br/><span>{$_('brand.item2Meta')}</span></div>
		</div>
		<div class="item">
			<div class="num">03</div>
			<div class="it"><b>{$_('brand.item3Title')}</b><br/><span>{$_('brand.item3Meta')}</span></div>
		</div>
	</div>

	<div class="meta">
		<div>
			<div class="k">{$_('brand.statTeachers')}</div>
			<div class="v">2 840</div>
		</div>
		<div>
			<div class="k">{$_('brand.statSessions')}</div>
			<div class="v">18,6<small>{$_('brand.thousandAbbr')}</small></div>
		</div>
		<div>
			<div class="k">{$_('brand.statUniversities')}</div>
			<div class="v">112</div>
		</div>
	</div>
</aside>
