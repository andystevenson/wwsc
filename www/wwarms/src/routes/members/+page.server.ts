import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, members, subscriptions, memberships, genders, eq } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('locals', locals);
	try {
		const all = await db
			.select({
				id: members.id,
				name: members.name,
				gender: genders.gender,
				other: genders.other,
				email: members.email,
				mobile: members.mobile,
				category: memberships.category,
				interval: memberships.interval,
				price: memberships.price,
				status: subscriptions.status
			})
			.from(subscriptions)
			.innerJoin(members, eq(members.id, subscriptions.member))
			.innerJoin(memberships, eq(memberships.id, subscriptions.membership))
			.innerJoin(genders, eq(genders.id, members.id))
			.orderBy(members.surname);
		return { members: all };
	} catch (e) {
		console.error(e);
		return error(500, 'database error');
	}
};
