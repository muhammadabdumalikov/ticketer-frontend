import { request } from './client';
import type { ApiQuestion } from './tickets';

export type SessionStatus = 'scheduled' | 'live' | 'finished';

export interface ApiSession {
	id: string;
	examId: string;
	ticketId: string;
	teacherId: string;
	scheduledAt: string | null;
	startedAt: string | null;
	endedAt: string | null;
	status: SessionStatus;
	ticketsPolicy: 'one-per-student' | 'allow-duplicates';
	createdAt: string;
	updatedAt: string;
	ticket?: {
		id: string;
		title: string;
		durationMin: number;
		subjectName: string;
		subjectCode: string;
	};
}

export interface ApiRoomMember {
	id: string;
	name: string;
	groupName: string;
	studentNumber: string | null;
	online: boolean;
	assignedTicketId: string | null;
	joinedAt: string;
}

export interface ApiAssignedTicket {
	id: string;
	title: string;
	durationMin: number;
	totalQuestions: number;
	questions: Array<Omit<ApiQuestion, 'correct' | 'rubric' | 'expected' | 'tolerance' | 'difficulty'>>;
}

export interface ApiMyState {
	member: ApiRoomMember & { sessionId: string };
	assignedTicket: ApiAssignedTicket | null;
	sessionId: string;
}

export interface JoinResponse {
	memberId: string;
	sessionToken: string;
	member: ApiRoomMember & { sessionId: string };
}

export interface AnswerItem {
	questionId: string;
	selectedIndex?: number;
	selectedIndices?: number[];
	textValue?: string;
	numericValue?: number;
}

export interface ApiUpcomingSession {
	id: string;
	status: SessionStatus;
	scheduledAt: string | null;
	startedAt: string | null;
	createdAt: string;
	examId: string;
	ticketTitle: string;
	durationMin: number;
	subjectCode: string;
	subjectName: string;
	questionCount: number;
	memberCount: number;
}

export const sessionsApi = {
	// Teacher
	create: (body: { examId: string; scheduledAt?: string; ticketsPolicy?: 'one-per-student' | 'allow-duplicates' }) =>
		request<ApiSession>('/sessions', { method: 'POST', body: JSON.stringify(body) }),
	listUpcoming: () => request<ApiUpcomingSession[]>('/sessions/upcoming'),
	get: (id: string) => request<ApiSession>(`/sessions/${id}`),
	roster: (id: string) => request<ApiRoomMember[]>(`/sessions/${id}/roster`),
	memberTicket: (id: string, memberId: string) =>
		request<{ assignedTicketId: string | null }>(`/sessions/${id}/members/${memberId}/ticket`),
	start: (id: string) => request<ApiSession>(`/sessions/${id}/start`, { method: 'POST' }),
	end: (id: string) => request<ApiSession>(`/sessions/${id}/end`, { method: 'POST' }),

	// Student
	join: (id: string, body: { name: string; group: string; studentNumber?: string }) =>
		request<JoinResponse>(`/sessions/${id}/members`, {
			method: 'POST',
			body: JSON.stringify(body)
		}),
	me: (id: string) => request<ApiMyState>(`/sessions/${id}/me`),
	submitAnswers: (id: string, answers: AnswerItem[]) =>
		request<{ ok: true }>(`/sessions/${id}/answers`, {
			method: 'POST',
			body: JSON.stringify({ answers })
		}),

	// Proctor
	verbalStart: (id: string, body: { memberId: string; questionId: string }) =>
		request<void>(`/sessions/${id}/verbal/start`, { method: 'POST', body: JSON.stringify(body) }),
	verbalStop: (id: string, body: { memberId: string; questionId: string }) =>
		request<void>(`/sessions/${id}/verbal/stop`, { method: 'POST', body: JSON.stringify(body) }),
	grade: (id: string, body: { memberId: string; questionId: string; pointsAwarded: number; notes?: string }) =>
		request<void>(`/sessions/${id}/grade`, { method: 'POST', body: JSON.stringify(body) })
};
