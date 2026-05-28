import { request } from './client';
import type { ApiQuestion, TicketStatus } from './tickets';

export interface ApiExamListItem {
	id: string;
	title: string;
	status: TicketStatus;
	durationMin: number;
	visibility: 'private' | 'department' | 'public';
	shuffleMode: 'fixed' | 'shuffle' | 'random-bank';
	questionCount: number;
	ticketCount: number;
	updated: string;
	author: string;
	subjectId: string;
	subjectName: string;
	subjectCode: string;
	subjectColor: string;
	subjectSigil: string;
}

export interface ApiExamTicket {
	id: string;
	title: string;
	position: number;
	questions: ApiQuestion[];
}

export interface ApiExamDetail {
	id: string;
	subjectId: string;
	authorId: string;
	title: string;
	description: string;
	durationMin: number;
	attempts: number;
	visibility: 'private' | 'department' | 'public';
	shuffleMode: 'fixed' | 'shuffle' | 'random-bank';
	status: TicketStatus;
	scheduledAt: string | null;
	createdAt: string;
	updatedAt: string;
	tickets: ApiExamTicket[];
}

export interface ExamQuestionInput {
	type: ApiQuestion['type'];
	text: string;
	points: number;
	time: number;
	difficulty: 'easy' | 'medium' | 'hard';
	answers?: string[];
	correct?: number | number[];
	expected?: string | number;
	tolerance?: number;
	rubric?: string;
}

export interface ExamTicketInput {
	title?: string;
	questions: ExamQuestionInput[];
}

export interface CreateExamInput {
	subjectId: string;
	details: {
		title: string;
		description?: string;
		duration: number;
		attempts?: number;
		visibility?: 'private' | 'department' | 'public';
		shuffle?: 'fixed' | 'shuffle' | 'random-bank';
	};
	tickets: ExamTicketInput[];
}

export interface UpdateExamInput {
	details?: CreateExamInput['details'];
	tickets?: ExamTicketInput[];
}

export const examsApi = {
	list: (filters: { subjectId?: string; status?: string; q?: string } = {}) => {
		const params = new URLSearchParams();
		if (filters.subjectId) params.set('subjectId', filters.subjectId);
		if (filters.status) params.set('status', filters.status);
		if (filters.q) params.set('q', filters.q);
		const qs = params.toString();
		return request<ApiExamListItem[]>(`/exams${qs ? `?${qs}` : ''}`);
	},
	listForSubject: (subjectId: string) =>
		request<ApiExamListItem[]>(`/subjects/${subjectId}/exams`),
	get: (id: string) => request<ApiExamDetail>(`/exams/${id}`),
	create: (body: CreateExamInput) =>
		request<ApiExamDetail>('/exams', { method: 'POST', body: JSON.stringify(body) }),
	update: (id: string, body: UpdateExamInput) =>
		request<ApiExamDetail>(`/exams/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
	publish: (id: string) => request<ApiExamDetail>(`/exams/${id}/publish`, { method: 'POST' }),
	share: (id: string) =>
		request<{ sessionId: string; status: 'scheduled' | 'live' | 'finished'; reused: boolean }>(
			`/exams/${id}/share`,
			{ method: 'POST' }
		),
	launch: (id: string) =>
		request<{ sessionId: string; status: 'scheduled' | 'live' | 'finished' }>(
			`/exams/${id}/launch`,
			{ method: 'POST' }
		),
	remove: (id: string) => request<void>(`/exams/${id}`, { method: 'DELETE' }),
	addTicket: (examId: string, body: ExamTicketInput) =>
		request<ApiExamDetail>(`/exams/${examId}/tickets`, {
			method: 'POST',
			body: JSON.stringify(body)
		})
};
