import '$lib/i18n';
import { auth } from '$lib/stores/auth.svelte';

export const ssr = false;
export const prerender = false;

export const load = () => {
	auth.hydrate();
	return {};
};
