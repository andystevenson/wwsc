import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, geo, WWSCGeo } from '$lib/db';

export const load: PageServerLoad = async () => {
	try {
		const all = await db.select().from(geo);
		return { geo: all, center: [WWSCGeo.longitude, WWSCGeo.latitude] };
	} catch (e) {
		console.error(e);
		return error(500, 'database error');
	}
};
