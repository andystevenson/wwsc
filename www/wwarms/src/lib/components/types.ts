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
	ID
} from '../db/schema';
import {
	Categories,
	Intervals,
	SubscriptionStatus,
	PreferenceTypes,
	GenderTypes
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
