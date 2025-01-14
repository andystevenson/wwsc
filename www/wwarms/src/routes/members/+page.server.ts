import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, eq, members, subscriptions, genders, memberships } from '$lib/db';

export const load: PageServerLoad = async () => {
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
				status: subscriptions.status,
				ends: subscriptions.ends
			})
			.from(subscriptions)
			.innerJoin(members, eq(members.id, subscriptions.member))
			.innerJoin(memberships, eq(memberships.id, subscriptions.membership))
			.innerJoin(genders, eq(genders.id, members.id));

		// we need to deduce the best subscription for each member,
		// typically will be the latest 'active' subscription

		type Member = (typeof all)[number];
		const grouped = Object.groupBy(all, ({ id }: Member) => id);

		const final = Object.values(grouped).map((group) => {
			if (!group) throw new TypeError('group is undefined');
			if (group.length === 1) return group[0];
			const sorted = group.sort((a, b) => b.ends.localeCompare(a.ends));
			return sorted[0];
		});

		return { members: final };
	} catch (e) {
		console.error(e);
		return error(500, 'database error');
	}
};
