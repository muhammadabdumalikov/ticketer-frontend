import { API_BASE_URL } from '$lib/env';
import { auth } from '$lib/stores/auth.svelte';

export class ApiError extends Error {
	constructor(
		public status: number,
		public body: unknown,
		message?: string
	) {
		super(message ?? `HTTP ${status}`);
	}
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	if (!headers.has('content-type') && init.body && !(init.body instanceof FormData)) {
		headers.set('content-type', 'application/json');
	}
	if (auth.token && !headers.has('authorization')) {
		headers.set('authorization', `Bearer ${auth.token}`);
	}

	const res = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers,
		credentials: 'include'
	});

	if (res.status === 204) return undefined as T;

	const text = await res.text();
	const body = text ? safeJson(text) : null;

	if (!res.ok) {
		const msg =
			(body && typeof body === 'object' && 'message' in body
				? Array.isArray((body as { message: unknown }).message)
					? ((body as { message: string[] }).message.join(', ') as string)
					: ((body as { message: string }).message as string)
				: undefined) ?? res.statusText;
		throw new ApiError(res.status, body, msg);
	}
	return body as T;
}

export function isUnauthorized(err: unknown): boolean {
	return err instanceof ApiError && err.status === 401;
}

/** Machine-readable `code` from an API error body, when the server sent one. */
export function errorCode(err: unknown): string | undefined {
	if (!(err instanceof ApiError) || !err.body || typeof err.body !== 'object') return undefined;
	const code = (err.body as { code?: unknown }).code;
	return typeof code === 'string' ? code : undefined;
}

function safeJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
