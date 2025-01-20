import type { PageServerLoad } from './$types';
import type { Category } from '$lib/db';
import {
	db,
	eq,
	sql,
	and,
	gt,
	lte,
	notInArray,
	isNull,
	members,
	campaignMemberships,
	subscriptions,
	memberships,
	genders,
	payouts
} from '$lib/db';

function categoryGrouping(category: Category) {
	let group = '';
	switch (category) {
		case 'hockey':
		case 'cricket':
		case 'social':
			group = category;
			break;
		case 'staff':
		case 'coach':
		case 'professional':
		case 'subcontractor':
		case 'guest-of':
		case 'honorary':
		case 'astro':
		case 'test':
			group = 'staff+others';
			break;
		default:
			group = 'gym+rackets';
			break;
	}
	return group;
}

export const load: PageServerLoad = async () => {
	const byCategory = (
		await db
			.select({ category: memberships.category, count: sql<number>`count(*)` })
			.from(subscriptions)
			.innerJoin(memberships, eq(subscriptions.membership, memberships.id))
			.where(eq(subscriptions.status, 'active'))
			.groupBy(memberships.category)
	).reduce(
		(acc, { category, count }) => {
			const group = categoryGrouping(category);
			acc[group] = (acc[group] || 0) + count;
			return acc;
		},
		{} as Record<string, number>
	);

	const byCampaign = await db
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

	const byGender = await db
		.select({ gender: genders.gender, count: sql<number>`count(*)` })
		.from(genders)
		.innerJoin(subscriptions, eq(genders.id, subscriptions.member))
		.where(eq(subscriptions.status, 'active'))
		.groupBy(genders.gender);

	const byStatus = await db
		.select({ status: subscriptions.status, count: sql<number>`count(*)` })
		.from(subscriptions)
		.groupBy(subscriptions.status);

	const count = await db.$count(members);
	const sq = db.$with('sq').as(
		db
			.select({
				age: sql<number>`cast(substr(timediff('now',${members.dob}), 2, 5) as integer)`.as('age')
			})
			.from(members)
	);
	const [ages] = await db
		.with(sq)
		.selectDistinct({
			adults: db.$count(sq, gt(sq.age, 18)),
			juniors: db.$count(sq, lte(sq.age, 18)),
			unknown: db.$count(sq, isNull(sq.age))
		})
		.from(sq);

	const month = sql<string>`strftime('%Y-%m', ${payouts.date})`;
	const byPayout = await db
		.select({
			month: month,
			total: sql<number>`sum(${payouts.amount})`
		})
		.from(payouts)
		.groupBy(month);

	return {
		ages,
		count,
		status: byStatus,
		categories: byCategory,
		campaigns: byCampaign,
		genders: byGender,
		payouts: byPayout.slice(-12)
	};
};
