import { io, type Socket } from 'socket.io-client';
import { WS_BASE_URL } from '$lib/env';
import { auth } from '$lib/stores/auth.svelte';

export function connectAsTeacher(sessionId: string): Socket {
	const sock = io(`${WS_BASE_URL}/sessions`, {
		auth: { token: auth.token },
		query: { sessionId },
		withCredentials: true,
		transports: ['websocket']
	});
	sock.on('connect', () => sock.emit('join', { sessionId }));
	return sock;
}

export function connectAsStudent(sessionId: string, sessionToken: string): Socket {
	const sock = io(`${WS_BASE_URL}/sessions`, {
		auth: { sessionToken },
		query: { sessionId, sessionToken },
		withCredentials: true,
		transports: ['websocket']
	});
	sock.on('connect', () => sock.emit('join', { sessionId }));
	return sock;
}
