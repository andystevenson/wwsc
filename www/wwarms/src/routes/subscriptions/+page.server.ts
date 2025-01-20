import type { PageServerLoad } from './$types';
import { db, sql, eq } from '$lib/db';
import { campaigns, campaignMemberships, memberships } from '$lib/db';

export const load: PageServerLoad = async () => {
	const selected = await db
		.select({
			campaign: campaigns.id,
			description: campaigns.description,
			category: memberships.category,
			interval: memberships.interval,
			membership: campaignMemberships.membership,
			membershipDescription: memberships.description,
			paying: memberships.paying,
			sports: memberships.sports,
			status: memberships.status,
			price: memberships.price,
			start: campaigns.start,
			end: campaigns.end,
			active: sql`${campaigns.start} <= (current_timestamp) and ${campaigns.end} >= (current_timestamp)`
		})
		.from(campaignMemberships)
		.innerJoin(campaigns, eq(campaigns.id, campaignMemberships.campaign))
		.innerJoin(memberships, eq(memberships.id, campaignMemberships.membership));

	return {
		campaigns: selected
	};
};
