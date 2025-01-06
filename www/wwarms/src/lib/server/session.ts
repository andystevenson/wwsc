import type { RequestEvent } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db, eq, users, sessions, type Session } from '$lib/db';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, user: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user,
		expires: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(sessions).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				name: users.name,
				email: users.email,
				access: users.access,
				image: users.image
			},
			session: { id: sessions.id, expires: sessions.expires }
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.user, users.email))
		.where(eq(sessions.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expires.getTime();
	if (sessionExpired) {
		await db.delete(sessions).where(eq(sessions.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expires.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expires = new Date(Date.now() + DAY_IN_MS * 30);
		await db.update(sessions).set({ expires: sessions.expires }).where(eq(sessions.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
