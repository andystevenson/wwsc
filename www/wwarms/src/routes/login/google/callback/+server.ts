import { google } from '$lib/server/oauth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/session';
import { decodeIdToken } from 'arctic';
import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { db, users, eq } from '$lib/db';
import { error } from '@sveltejs/kit';

export type GoogleClaims = {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	hd: string;
	email: string;
	email_verified: boolean;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
};

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || codeVerifier === null || code === null || state === null) {
		return error(400, 'google login failed');
	}

	if (storedState !== state) {
		return error(400, 'google login security failed');
	}

	const tokens: OAuth2Tokens = await google.validateAuthorizationCode(code, codeVerifier);

	const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
	console.dir({ claims });

	const { sub: googleId, name, email, picture } = claims;
	console.dir({ googleId, name, email, picture });
	// const existingUser = getUserFromGoogleId(googleId);

	const [existingUser] = await db
		.select({ id: users.email })
		.from(users)
		.where(eq(users.googleId, googleId));

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expires);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	// extra step here to detect if this user is permitted on the app
	// emails are guaranteed unique in the database

	const [user] = await db.select().from(users).where(eq(users.email, email));
	if (user) {
		await db.update(users).set({ googleId, image: picture }).where(eq(users.email, user.email));
		// const user = createUser(googleId, email, name, picture);
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.email);
		setSessionTokenCookie(event, sessionToken, session.expires);
		console.dir('logged in', { user, email, session });
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}
	// unautorised user
	console.error('google login user not permitted.', { email });
	return error(403, 'google user not permitted.');
}
