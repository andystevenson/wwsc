<script lang="ts">
	import type { PageData } from './$types';
	import MemberList from '$lib/components/MemberList.svelte';
	import MemberFilters from '$lib/components/MemberFilters.svelte';
	import type { WWMember, Category, Interval, Status } from '$lib/components/types';
	import { SvelteSet } from 'svelte/reactivity';
	let { data }: { data: PageData } = $props();

	let search = $state('');
	let campaignFilters = new SvelteSet<string>();
	let statusFilters = new SvelteSet<Status>(['active']);
	let intervalFilters = new SvelteSet<Interval>();
	let categoryFilters = new SvelteSet<Category>();

	let filteredMembers = $derived.by(() => {
		// no filters then everything
		if (
			!search &&
			!campaignFilters.size &&
			!statusFilters.size &&
			!intervalFilters.size &&
			!categoryFilters.size
		)
			return data.members;
		return data.members.filter(
			(member: WWMember) =>
				inCampaign(member) &&
				inStatus(member) &&
				inInterval(member) &&
				inCategory(member) &&
				inSearch(member)
		);
	});

	export function findMembershipInCampaigns(membership: string) {
		let found = data.activeCampaigns.find((c) => c.membership === membership);
		if (!found) return null;
		return found;
	}

	function inCampaign(member: WWMember) {
		let noCampaignsSelected = campaignFilters.size === 0;
		if (noCampaignsSelected) return true;
		let found = findMembershipInCampaigns(member.membership);
		if (!found) return false;
		return campaignFilters.has(found?.id);
	}

	function inStatus(member: WWMember) {
		return statusFilters.size === 0 || statusFilters.has(member.status);
	}

	function inInterval(member: WWMember) {
		return intervalFilters.size === 0 || intervalFilters.has(member.interval);
	}

	function inCategory(member: WWMember) {
		return categoryFilters.size === 0 || categoryFilters.has(member.category);
	}

	function inSearch(member: WWMember) {
		const lsearch = search.toLowerCase();
		const lname = member.name?.toLowerCase();
		const lemail = member.email?.toLowerCase();
		const lmobile = member.mobile?.toLowerCase();
		const lcategory = member.category.toLowerCase();
		const linterval = member.interval.toLowerCase();
		let result =
			!search ||
			lname?.includes(lsearch) ||
			lemail?.includes(lsearch) ||
			lmobile?.includes(lsearch) ||
			lcategory.includes(lsearch) ||
			linterval.includes(lsearch);
		return result;
	}

	function updateCampaigns(c: string, checked: boolean) {
		checked ? campaignFilters.add(c) : campaignFilters.delete(c);
	}

	function updateStatus(s: Status, checked: boolean) {
		checked ? statusFilters.add(s) : statusFilters.delete(s);
	}

	function updateSearch(s: string) {
		search = s;
	}

	function updateIntervals(interval: Interval, checked: boolean) {
		checked ? intervalFilters.add(interval) : intervalFilters.delete(interval);
	}

	function updateCategories(category: Category, checked: boolean) {
		checked ? categoryFilters.add(category) : categoryFilters.delete(category);
	}
</script>

<section>
	<MemberFilters
		activeCampaigns={data.activeCampaigns}
		{updateCampaigns}
		{updateStatus}
		{updateSearch}
		{updateIntervals}
		{updateCategories}
	/>
	<div class="counts">{filteredMembers.length} of {data.members.length}</div>
	<MemberList members={filteredMembers} />
</section>

<style>
	section {
		display: grid;
		grid-template-rows: auto 1fr;
		max-block-size: 100vh;
	}

	.counts {
		opacity: 0.5;
		font-size: small;
	}
</style>
