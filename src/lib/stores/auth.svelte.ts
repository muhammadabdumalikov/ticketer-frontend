import { request } from '$lib/api/client';

export interface PublicUser {
	id: string;
	email: string;
	name: string;
	role: string;
	department: string | null;
}

const TOKEN_KEY = 'ticketer_token';
const USER_KEY = 'ticketer_user';

class AuthStore {
	token = $state<string | null>(null);
	user = $state<PublicUser | null>(null);
	hydrated = $state(false);

	hydrate() {
		if (this.hydrated || typeof localStorage === 'undefined') return;
		this.token = localStorage.getItem(TOKEN_KEY);
		const raw = localStorage.getItem(USER_KEY);
		if (raw) {
			try {
				this.user = JSON.parse(raw) as PublicUser;
			} catch {
				this.user = null;
			}
		}
		this.hydrated = true;
	}

	async login(email: string, password: string): Promise<PublicUser> {
		const res = await request<{ accessToken: string; user: PublicUser }>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		});
		this.token = res.accessToken;
		this.user = res.user;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(TOKEN_KEY, res.accessToken);
			localStorage.setItem(USER_KEY, JSON.stringify(res.user));
		}
		return res.user;
	}

	logout() {
		this.token = null;
		this.user = null;
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
		}
	}
}

export const auth = new AuthStore();
