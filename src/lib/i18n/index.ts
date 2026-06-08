import { addMessages, init, locale } from 'svelte-i18n';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const LOCALES = ['ru', 'uz'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = { ru: 'RU', uz: 'UZ' };

const LOCALE_KEY = 'ticketer_locale';
const DEFAULT_LOCALE: Locale = 'ru';

addMessages('ru', ru);
addMessages('uz', uz);

function isLocale(value: string | null): value is Locale {
	return value !== null && (LOCALES as readonly string[]).includes(value);
}

function storedLocale(): Locale {
	if (typeof localStorage === 'undefined') return DEFAULT_LOCALE;
	const v = localStorage.getItem(LOCALE_KEY);
	return isLocale(v) ? v : DEFAULT_LOCALE;
}

const initial = storedLocale();

init({ fallbackLocale: DEFAULT_LOCALE, initialLocale: initial });

if (typeof document !== 'undefined') document.documentElement.lang = initial;

export function setLocale(next: Locale): void {
	locale.set(next);
	if (typeof localStorage !== 'undefined') localStorage.setItem(LOCALE_KEY, next);
	if (typeof document !== 'undefined') document.documentElement.lang = next;
}
