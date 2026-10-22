import { io, type Socket } from 'socket.io-client';
import { WS_BASE_URL } from '$lib/env';
import { auth } from '$lib/stores/auth.svelte';
import { sessionsApi } from '$lib/api/sessions';
import { isUnauthorized } from '$lib/api/client';

// WebSocket first; fall back to HTTP long-polling on networks (campus proxies,
// firewalls) that block the upgrade.
const TRANSPORTS = { transports: ['websocket', 'polling'], tryAllTransports: true };

export function connectAsTeacher(sessionId: string): Socket {
	const sock = io(`${WS_BASE_URL}/sessions`, {
		auth: { token: auth.token },
		query: { sessionId },
		withCredentials: true,
		...TRANSPORTS
	});
	sock.on('connect', () => sock.emit('join', { sessionId }));
	return sock;
}

/**
 * Open the student's realtime channel. `close` must be used instead of
 * `sock.disconnect()` so a pending retry does not reopen a closed socket.
 *
 * `onAuthLost` fires when the server no longer accepts the session token —
 * the same student joined again from another tab or device.
 */
export function connectAsStudent(
	sessionId: string,
	sessionToken: string,
	onAuthLost?: () => void
): { sock: Socket; close: () => void } {
	const sock = io(`${WS_BASE_URL}/sessions`, {
		auth: { sessionToken },
		query: { sessionId, sessionToken },
		withCredentials: true,
		...TRANSPORTS
	});
	let closed = false;
	let retry: ReturnType<typeof setTimeout> | undefined;

	sock.on('connect', () => sock.emit('join', { sessionId }));
	// The server only drops a socket itself when the handshake fails, and
	// socket.io never retries those. Ask the API whether the token is still
	// valid: if it is, the failure was transient and we reconnect.
	sock.on('disconnect', (reason) => {
		if (reason !== 'io server disconnect' || closed) return;
		sessionsApi.me(sessionId, sessionToken).then(
			() => scheduleReconnect(),
			(err) => (isUnauthorized(err) ? onAuthLost?.() : scheduleReconnect())
		);
	});

	function scheduleReconnect() {
		if (closed) return;
		retry = setTimeout(() => !closed && sock.connect(), 2000);
	}

	return {
		sock,
		close: () => {
			closed = true;
			clearTimeout(retry);
			sock.disconnect();
		}
	};
}
