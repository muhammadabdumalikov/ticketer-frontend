import type { ApiRoomMember } from './sessions';

export interface RosterStudent {
	id: string;
	name: string;
	group: string;
	sig: string;
	online: boolean;
	me: boolean;
	assignedTicketId: string | null;
}

export function deriveSig(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	return parts[0].slice(0, 2).toUpperCase();
}

export function toRosterStudent(m: ApiRoomMember, myMemberId?: string | null): RosterStudent {
	return {
		id: m.id,
		name: m.name,
		group: m.groupName,
		sig: deriveSig(m.name),
		online: m.online,
		me: myMemberId != null && m.id === myMemberId,
		assignedTicketId: m.assignedTicketId
	};
}

export function formatTime(secs: number): string {
	const m = Math.floor(secs / 60);
	const s = secs % 60;
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
