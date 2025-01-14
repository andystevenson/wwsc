// routes/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/session';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session === null || locals.user === null) {
		return redirect(302, '/login');
	}
	return { user: locals.user };
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
		return redirect(302, '/login');
	}
};
