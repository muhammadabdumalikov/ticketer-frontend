import { request } from './client';
import type { PublicUser } from '$lib/stores/auth.svelte';

export const authApi = {
	me: () => request<{ user: PublicUser }>('/auth/me')
};
