import type { PageServerLoad } from './$types';
import { db, sql, campaignMemberships, campaigns } from '$lib/db';

export const load: PageServerLoad = async () => {
	const all = await db.select().from(campaigns);
	const memberships = await db
		.select({ campaign: campaignMemberships.campaign, count: sql<number>`count(*)` })
		.from(campaignMemberships)
		.groupBy(campaignMemberships.campaign);
	return { all, memberships };
};
