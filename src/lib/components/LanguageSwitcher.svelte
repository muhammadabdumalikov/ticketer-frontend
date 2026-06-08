<script lang="ts">
	import { locale } from 'svelte-i18n';
	import { setLocale, LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n';

	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="lang-switch" class:compact role="group" aria-label="Language">
	{#each LOCALES as l (l)}
		<button
			type="button"
			class="lang-opt"
			class:active={$locale === l}
			aria-pressed={$locale === l}
			onclick={() => setLocale(l as Locale)}
		>
			{LOCALE_LABELS[l]}
		</button>
	{/each}
</div>

<style>
	.lang-switch {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 3px;
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 4%, transparent);
	}
	.lang-opt {
		appearance: none;
		border: none;
		background: transparent;
		cursor: pointer;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		line-height: 1;
		padding: 5px 10px;
		border-radius: 999px;
		color: color-mix(in srgb, currentColor 60%, transparent);
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}
	.lang-opt:hover {
		color: currentColor;
	}
	.lang-opt.active {
		background: color-mix(in srgb, currentColor 12%, transparent);
		color: currentColor;
	}
	.compact .lang-opt {
		padding: 4px 8px;
		font-size: 0.68rem;
	}
</style>
