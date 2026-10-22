// A student's place in an exam session, kept so a reload or a reopened tab
// returns them to the exam instead of the join form.
//
// sessionStorage is per tab and survives reloads, so it is trusted as-is.
// localStorage survives closing the tab but is shared by every tab in the
// browser (several students on one machine), so a seat found only there is
// offered to the student to confirm rather than resumed silently.

export interface StudentSeat {
	sessionToken: string;
	memberId: string;
	name: string;
}

const key = (sessionId: string) => `ticketer_seat:${sessionId}`;

function read(storage: Storage, sessionId: string): StudentSeat | null {
	try {
		const raw = storage.getItem(key(sessionId));
		if (!raw) return null;
		const seat = JSON.parse(raw) as StudentSeat;
		return seat.sessionToken && seat.memberId ? seat : null;
	} catch {
		return null;
	}
}

export function loadSeat(sessionId: string): { seat: StudentSeat; thisTab: boolean } | null {
	const own = read(sessionStorage, sessionId);
	if (own) return { seat: own, thisTab: true };
	const shared = read(localStorage, sessionId);
	return shared ? { seat: shared, thisTab: false } : null;
}

export function saveSeat(sessionId: string, seat: StudentSeat): void {
	const raw = JSON.stringify(seat);
	try {
		sessionStorage.setItem(key(sessionId), raw);
		localStorage.setItem(key(sessionId), raw);
	} catch {
		// Storage can be unavailable (private mode, quota); the exam still works.
	}
}

export function clearSeat(sessionId: string): void {
	try {
		sessionStorage.removeItem(key(sessionId));
		localStorage.removeItem(key(sessionId));
	} catch {
		// ignore
	}
}
