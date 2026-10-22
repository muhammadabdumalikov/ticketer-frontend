import { derived } from 'svelte/store';
import { _, locale } from 'svelte-i18n';

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

/** `$relativeTime(iso)`: "5 daqiqa oldin" / "5 минут назад" in the current locale. */
export const relativeTime = derived(locale, ($locale) => {
	const fmt = new Intl.RelativeTimeFormat($locale ?? 'ru', { numeric: 'auto' });
	return (iso: string): string => {
		const sec = (new Date(iso).getTime() - Date.now()) / 1000;
		const abs = Math.abs(sec);
		if (abs < 60) return fmt.format(0, 'second');
		if (abs < 3600) return fmt.format(Math.round(sec / 60), 'minute');
		if (abs < 86400) return fmt.format(Math.round(sec / 3600), 'hour');
		if (abs < 604800) return fmt.format(Math.round(sec / 86400), 'day');
		return fmt.format(Math.round(sec / 604800), 'week');
	};
});
