<script lang="ts">
	export type IconName =
		| 'home' | 'book' | 'ticket' | 'calendar' | 'bank' | 'chart' | 'settings'
		| 'search' | 'bell' | 'help' | 'plus' | 'arrow' | 'back' | 'up' | 'down'
		| 'chev' | 'more' | 'dots' | 'trash' | 'copy' | 'drag' | 'clock' | 'star'
		| 'list' | 'bolt' | 'eye' | 'eyeOff' | 'save' | 'filter' | 'check' | 'user'
		| 'mic' | 'shield' | 'flag' | 'noSign' | 'bookmark' | 'calc' | 'bars'
		| 'triangle' | 'table' | 'exit' | 'play' | 'mail' | 'lock' | 'building'
		| 'gradCap' | 'key' | 'google' | 'ms' | 'loader' | 'share' | 'link';

	interface Props {
		name: IconName;
		size?: number;
		stroke?: number;
		class?: string;
		style?: string;
	}

	let { name, size, stroke = 1.6, class: cls = '', style = '' }: Props = $props();

	const defaults: Record<string, number> = {
		check: 13, plus: 16, arrow: 16, back: 14, up: 12, down: 12, chev: 14,
		more: 16, dots: 14, trash: 15, copy: 15, drag: 14, clock: 15, star: 15,
		list: 15, bolt: 14, eye: 14, save: 14, filter: 14, user: 14, mic: 14,
		shield: 13, key: 14, ms: 16, play: 16, loader: 16
	};
	let w = $derived(size ?? defaults[name] ?? 18);
</script>

{#if name === 'home'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>
{:else if name === 'book'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2z"/><path d="M4 5v14"/></svg>
{:else if name === 'ticket'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M9 6v12" stroke-dasharray="2 2"/></svg>
{:else if name === 'calendar'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
{:else if name === 'bank'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 20h18"/></svg>
{:else if name === 'chart' || name === 'bars'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M6 20V10M12 20V4M18 20v-6"/></svg>
{:else if name === 'settings'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
{:else if name === 'search'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
{:else if name === 'bell'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
{:else if name === 'help'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7"/><path d="M12 17h.01"/></svg>
{:else if name === 'plus'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M12 5v14M5 12h14"/></svg>
{:else if name === 'arrow'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
{:else if name === 'back'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
{:else if name === 'up'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M5 15l7-7 7 7"/></svg>
{:else if name === 'down'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M5 9l7 7 7-7"/></svg>
{:else if name === 'chev'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M9 6l6 6-6 6"/></svg>
{:else if name === 'more'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" class={cls} {style}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
{:else if name === 'dots'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" class={cls} {style}><circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/></svg>
{:else if name === 'trash'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v7M14 11v7"/></svg>
{:else if name === 'copy'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
{:else if name === 'drag'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" class={cls} {style}><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
{:else if name === 'clock'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
{:else if name === 'star'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>
{:else if name === 'list'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M4 6h16M4 12h16M4 18h10"/></svg>
{:else if name === 'bolt'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
{:else if name === 'eye'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
{:else if name === 'eyeOff'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M3 3l18 18"/><path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.3 4M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6c1.5 0 2.9-.3 4-.8"/><path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-5.1"/></svg>
{:else if name === 'save'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>
{:else if name === 'filter'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>
{:else if name === 'check'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><polyline points="4 12 10 18 20 6"/></svg>
{:else if name === 'user'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
{:else if name === 'mic'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>
{:else if name === 'shield'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>
{:else if name === 'flag'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M5 21V4M5 4h10l-2 4 2 4H5"/></svg>
{:else if name === 'noSign'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>
{:else if name === 'bookmark'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M6 4h12v17l-6-4-6 4z"/></svg>
{:else if name === 'calc'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h2M12 19h2M16 19h.01"/></svg>
{:else if name === 'triangle'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M12 3l9 16H3z"/></svg>
{:else if name === 'table'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 11h18M9 5v14"/></svg>
{:else if name === 'exit'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M9 12h12M16 7l5 5-5 5"/><path d="M14 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"/></svg>
{:else if name === 'play'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" class={cls} {style}><path d="M7 4v16l13-8z"/></svg>
{:else if name === 'mail'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>
{:else if name === 'lock'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>
{:else if name === 'building'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M4 21V6l8-3 8 3v15"/><path d="M4 21h16"/><path d="M9 21V11"/><path d="M15 21V11"/><path d="M9 7h.01M15 7h.01"/></svg>
{:else if name === 'gradCap'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M3 9l9-4 9 4-9 4-9-4z"/><path d="M7 11v5c0 .9 2.5 2 5 2s5-1.1 5-2v-5"/><path d="M21 9v5"/></svg>
{:else if name === 'key'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/></svg>
{:else if name === 'google'}
	<svg width={w} height={w} viewBox="0 0 48 48" class={cls} {style}><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.3-13.3l5.7-5.6A20 20 0 1 0 44 24a20 20 0 0 0-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 8 3l5.7-5.6A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28L6.2 33A20 20 0 0 0 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3A20 20 0 0 0 44 24a20 20 0 0 0-.4-3.5z"/></svg>
{:else if name === 'ms'}
	<svg width={w} height={w} viewBox="0 0 24 24" class={cls} {style}><rect x="2" y="2" width="9" height="9" fill="#F25022"/><rect x="13" y="2" width="9" height="9" fill="#7FBA00"/><rect x="2" y="13" width="9" height="9" fill="#00A4EF"/><rect x="13" y="13" width="9" height="9" fill="#FFB900"/></svg>
{:else if name === 'loader'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class={cls} {style}><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>
{:else if name === 'share'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>
{:else if name === 'link'}
	<svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class={cls} {style}><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07L11 6"/><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07L13 18"/></svg>
{/if}
