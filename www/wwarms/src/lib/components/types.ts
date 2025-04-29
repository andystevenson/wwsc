import { SvelteSet } from 'svelte/reactivity';
import type {
	Campaign,
	Member,
	Gender,
	Membership,
	MembershipStatus,
	MembershipScope,
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

export type WWMember = WWMemberPart &
	WWGenderPart &
	WWMembershipPart &
	WWSubscriptionPart & { membership: ID };
export type WWFamilyMember = WWMemberPart & WWMemberDOBPart & WWGenderPart;
export type { Category, Interval, Status, PreferenceType, GenderType };
export { Categories, Intervals, SubscriptionStatus, PreferenceTypes, GenderTypes };

export type WWCampaignMembership = {
	campaign: ID;
	description: string;
	category: Category;
	scope: MembershipScope;
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

export type WWActiveCampaign = Campaign & {
	membership: ID;
	active: boolean;
};

export type InputNewMember = {
	campaign: string;
	category: Category;
	membership: string;
	id: string;
	existing: string;
	firstName: string;
	surname: string;
	email: string;
	dob: string;
	gender: GenderType;
	other: string;
	line1: string;
	line2: string;
	city: string;
	postcode: string;
	mobile: string;
	preferences: SvelteSet<PreferenceType>;
};

export type ValidatedNewMember = InputNewMember & {
	valid: boolean;
};

export const DefaultNewMember: ValidatedNewMember = {
	campaign: '',
	category: 'test',
	membership: '',
	id: '',
	existing: 'new member',
	firstName: '',
	surname: '',
	email: '',
	dob: '',
	gender: 'unknown',
	other: '',
	line1: '',
	line2: '',
	city: '',
	postcode: '',
	mobile: '',
	preferences: new SvelteSet<PreferenceType>(['sms-marketing', 'email-marketing']),
	valid: false
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

export type { ID, CollectionMethod, PaymentStatus };
export { CollectionMethods, PaymentStatuses };
