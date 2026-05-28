import { request } from './client';

export interface ApiSubject {
	id: string;
	name: string;
	code: string;
	sigil: string;
	color: string;
	status: 'active' | 'live' | 'draft';
	tickets: number;
	exams: number;
	students: number;
	progress: number;
}

export interface CreateSubjectInput {
	name: string;
	code: string;
	sigil: string;
	color: string;
	status?: 'active' | 'live' | 'draft';
}

export interface UpdateSubjectInput extends Partial<CreateSubjectInput> {}

// Frontend-friendly alias preserved from the original mock-data type.
export type Subject = ApiSubject;

export const subjectsApi = {
	list: () => request<ApiSubject[]>('/subjects'),
	get: (id: string) => request<ApiSubject>(`/subjects/${id}`),
	create: (body: CreateSubjectInput) =>
		request<ApiSubject>('/subjects', { method: 'POST', body: JSON.stringify(body) }),
	createMock: () => request<ApiSubject>('/subjects/mock', { method: 'POST' }),
	removeMock: () => request<{ removed: number }>('/subjects/mock', { method: 'DELETE' }),
	update: (id: string, body: UpdateSubjectInput) =>
		request<ApiSubject>(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
	remove: (id: string) => request<void>(`/subjects/${id}`, { method: 'DELETE' })
};
