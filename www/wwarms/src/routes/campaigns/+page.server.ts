import type { PageServerLoad } from './$types';
import {
	db,
	eq,
	sql,
	and,
	notInArray,
	getTableColumns,
	campaignMemberships,
	campaigns,
	subscriptions
} from '$lib/db';

export const load: PageServerLoad = async () => {
	const memberships = await db
		.select({ campaign: campaignMemberships.campaign, count: sql<number>`count(*)` })
		.from(campaignMemberships)
		.groupBy(campaignMemberships.campaign);

	const actives = await db
		.select({ campaign: campaignMemberships.campaign, count: sql<number>`count(*)` })
		.from(campaignMemberships)
		.innerJoin(subscriptions, eq(subscriptions.membership, campaignMemberships.membership))
		.where(
			and(
				eq(subscriptions.status, 'active'),
				notInArray(campaignMemberships.campaign, ['monthly', 'yearly'])
			)
		)
		.groupBy(campaignMemberships.campaign);

	const list = await db
		.select({
			...getTableColumns(campaigns),
			active: sql<boolean>`${campaigns.start} <= (current_timestamp) and ${campaigns.end} >= (current_timestamp)`
		})
		.from(campaigns);
	return { campaigns: list, memberships, actives };
};
