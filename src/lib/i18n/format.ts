import { derived } from 'svelte/store';
import { _ } from 'svelte-i18n';

// Tickets without a custom name are stored as "Билет №N" — the server's
// canonical auto-title. Older builder versions also saved the Uzbek default
// "N-bilet". Both are shown in the viewer's language.
const AUTO_TICKET_TITLE = [/^Билет №(\d+)$/, /^(\d+)-bilet$/];

/** The ticket number when `title` is an auto-generated name, otherwise null. */
export function autoTicketNumber(title: string): number | null {
	for (const re of AUTO_TICKET_TITLE) {
		const m = title.trim().match(re);
		if (m) return Number(m[1]);
	}
	return null;
}

/** `$ticketTitle(title)`: auto-named tickets localised, custom names as typed. */
export const ticketTitle = derived(_, ($t) => (title: string) => {
	const n = autoTicketNumber(title);
	return n === null ? title : $t('builder.tickets.defaultTitle', { values: { n } });
});

/**
 * `$relativeTime(iso)`: "5 daqiqa oldin" / "5 минут назад".
 * Built from our own translations: `Intl.RelativeTimeFormat` has no usable
 * Uzbek data in Chrome and prints "-20 h" / "-6 w".
 */
export const relativeTime = derived(_, ($t) => {
	return (iso: string): string => {
		const age = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
		if (age < 60) return $t('ago.justNow');
		if (age < 3600) return $t('ago.minutes', { values: { n: Math.floor(age / 60) } });
		if (age < 86400) return $t('ago.hours', { values: { n: Math.floor(age / 3600) } });
		if (age < 604800) return $t('ago.days', { values: { n: Math.floor(age / 86400) } });
		return $t('ago.weeks', { values: { n: Math.floor(age / 604800) } });
	};
});
