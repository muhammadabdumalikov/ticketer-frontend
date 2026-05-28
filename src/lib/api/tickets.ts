import { request } from './client';

export type QuestionType = 'single' | 'multi' | 'text' | 'numeric' | 'verbal';
export type TicketStatus = 'Черновик' | 'Опубликован' | 'Запланирован' | 'Архив';

export interface ApiQuestion {
	id: string;
	type: QuestionType;
	text: string;
	points: number;
	time: number;
	difficulty: 'easy' | 'medium' | 'hard';
	position: number;
	answers?: string[];
	correct?: number | number[];
	expected?: string | number;
	tolerance?: number;
	rubric?: string;
}

export interface ApiTicketDetail {
	id: string;
	examId: string;
	subjectId: string;
	authorId: string;
	title: string;
	position: number;
	createdAt: string;
	updatedAt: string;
	exam: {
		id: string;
		title: string;
		description: string;
		durationMin: number;
		attempts: number;
		visibility: 'private' | 'department' | 'public';
		shuffleMode: 'fixed' | 'shuffle' | 'random-bank';
		status: TicketStatus;
		subjectId: string;
	};
	questions: ApiQuestion[];
}

export const ticketsApi = {
	get: (id: string) => request<ApiTicketDetail>(`/tickets/${id}`),
	update: (id: string, body: { title?: string; questions?: Array<Omit<ApiQuestion, 'id' | 'position'>> }) =>
		request<ApiTicketDetail>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
	remove: (id: string) => request<void>(`/tickets/${id}`, { method: 'DELETE' })
};
