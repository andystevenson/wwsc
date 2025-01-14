import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (locals.session === null || locals.user === null) {
		return redirect(302, '/login');
	}

	return redirect(302, '/members');
	return locals.user;
}
