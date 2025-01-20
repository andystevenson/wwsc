import type {
	Member,
	Gender,
	Membership,
	MembershipStatus,
	Subscription,
	Category,
	Interval,
	Status,
	PreferenceType,
	GenderType,
	CollectionMethod,
	PaymentStatus,
	ID
} from '../db/schema';
import {
	Categories,
	Intervals,
	SubscriptionStatus,
	PreferenceTypes,
	GenderTypes,
	PaymentStatuses,
	CollectionMethods
} from '../db/schema';

export type WWMemberPart = Pick<Member, 'id' | 'name' | 'email' | 'mobile'>;
export type WWMemberDOBPart = Pick<Member, 'dob'>;
export type WWGenderPart = Omit<Gender, 'id'>;
export type WWMembershipPart = Pick<Membership, 'category' | 'interval' | 'price'>;
export type WWSubscriptionPart = Pick<Subscription, 'status'>;

export type WWMember = WWMemberPart & WWGenderPart & WWMembershipPart & WWSubscriptionPart;
export type WWFamilyMember = WWMemberPart & WWMemberDOBPart & WWGenderPart;
export type { Category, Interval, Status, PreferenceType, GenderType };
export { Categories, Intervals, SubscriptionStatus, PreferenceTypes, GenderTypes };

export type WWCampaignMembership = {
	campaign: ID;
	description: string;
	category: Category;
	interval: Interval;
	membership: ID;
	membershipDescription: string;
	paying: boolean;
	sports: boolean;
	status: MembershipStatus;
	price: number;
	start: string;
	end: string;
	active: boolean;
};

export type WWMembership = {
	id: ID;
	category: Category;
	interval: Interval;
};

export function clearerStatus(status: Status) {
	let s = status as string;
	switch (status) {
		case 'active':
		case 'incomplete':
		case 'trialing':
		case 'unpaid':
		case 'paused':
			break;
		case 'past_due':
			s = 'overdue';
			break;
		case 'canceled':
			s = 'cancelled';
			break;
		case 'incomplete_expired':
			s = 'expired';
			break;
	}
	return s;
}

export function clearerCollectionMethod(method: CollectionMethod) {
	let m = method as string;
	switch (method) {
		case 'charge_automatically':
			m = 'automatic';
			break;
		case 'send_invoice':
			m = 'invoice';
			break;
	}
	return m;
}

type Base = { count: number };
export function normalize<T extends Base>(dataset: T[]) {
	return dataset
		.toSorted((a, b) => b.count - a.count)
		.reduce(
			(dataset, next) => {
				const key = Object.keys(next).find((key) => key !== 'count')!;
				const { count } = next;
				const index = next[key as keyof T] as string;
				dataset[index] = count;
				return dataset;
			},
			{} as Record<string, number>
		);
}

export type { CollectionMethod, PaymentStatus };
export { CollectionMethods, PaymentStatuses };
