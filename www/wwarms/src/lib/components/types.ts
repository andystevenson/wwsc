import type {
	Member,
	Gender,
	Membership,
	Subscription,
	Category,
	Interval,
	Status
} from '../db/schema';
import { Categories, Intervals, SubscriptionStatus } from '../db/schema';

export type WWMemberPart = Pick<Member, 'id' | 'name' | 'email' | 'mobile'>;
export type WWGenderPart = Omit<Gender, 'id'>;
export type WWMembershipPart = Pick<Membership, 'category' | 'interval' | 'price'>;
export type WWSubscriptionPart = Pick<Subscription, 'status'>;

export type WWMember = WWMemberPart & WWGenderPart & WWMembershipPart & WWSubscriptionPart;
export type { Category, Interval, Status };
export { Categories, Intervals, SubscriptionStatus };
