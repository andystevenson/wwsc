<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Interval from './Interval.svelte';
	import Category from './Category.svelte';
	import Membership from './Membership.svelte';
	import Campaign from './Campaign.svelte';
	import SelectedMember from './SelectedMember.svelte';

	import type {
		Category as CategoryType,
		Interval as IntervalType,
		WWCampaignMembership
	} from './types';

	import { page } from '$app/state';

	type MUpdate = (m: WWCampaignMembership | null) => void;
	type Props = {
		select?: MUpdate;
	};

	let { select }: Props = $props();
	function doSelect(m: WWCampaignMembership | null) {
		if (select) select(m);
		selectedMembership = m;
	}

	let { data } = page;

	let campaigns = data?.campaigns as WWCampaignMembership[];
	if (!campaigns) throw new TypeError('campaigns not found');

	function findMembershipInCampaigns(membership: string) {
		let found = campaigns.find((c) => c.membership === membership);
		if (!found) return null;
		return found;
	}
	let campaign = $state('');

	let activeCampaigns = campaigns
		.filter((c) => c.active && c.campaign !== 'yearly' && c.campaign !== 'monthly')
		.map((c) => c.campaign);
	let initialCampaigns = new SvelteSet<string>([...activeCampaigns]);

	let selectedCampaigns = new SvelteSet<string>();
	function updateCampaign(c: string, checked: boolean) {
		selectedCampaigns.clear();
		campaign = '';
		clearSelectedMembership();
		if (checked) {
			campaign = c;
			selectedCampaigns.add(c);
		}
	}

	let category: CategoryType | null = $state(null);

	let activeCategories = campaigns
		.filter((c) => c.status === 'active' && c.active)
		.map((c) => c.category);
	let initialCategories = new SvelteSet<CategoryType>([...activeCategories]);
	let selectedCategories = new SvelteSet<CategoryType>();
	function updateCategory(c: CategoryType, checked: boolean) {
		selectedCategories.clear();
		category = null;
		clearSelectedMembership();

		if (checked) {
			category = c;
			selectedCategories.add(c);
		}
	}

	let interval: IntervalType | null = $state(null);
	let selectedIntervals = new SvelteSet<IntervalType>();
	function updateInterval(i: IntervalType, checked: boolean) {
		selectedIntervals.clear();
		interval = null;
		clearSelectedMembership();

		if (checked) {
			interval = i;
			selectedIntervals.add(i);
		}
	}

	let membership = $state('');
	let initialMemberships = $derived.by(() => {
		let activeMemberships = campaigns
			.filter((c) => {
				if (!campaign && !category && !interval) return false;
				let isCampaign =
					!campaign || (c.campaign === campaign && c.status === 'active' && c.active);
				let isCategory =
					!category || (c.category === category && c.status === 'active' && c.active);
				let isInterval = !interval || c.interval === interval;
				return isCampaign && isCategory && isInterval;
			})
			.map((c) => c.membership);

		return new SvelteSet<string>([...activeMemberships]);
	});

	function clearSelectedMembership() {
		selectedMemberships.clear();
		membership = '';
		doSelect(null);
	}

	let selectedMemberships = new SvelteSet<string>();
	let selectedMembership: WWCampaignMembership | null = $state(null);
	function updateMembership(m: string, checked: boolean) {
		clearSelectedMembership();
		if (checked) {
			membership = m;
			selectedMembership = findMembershipInCampaigns(m);
			doSelect(selectedMembership);
			selectedMemberships.add(m);
		}
	}
</script>

<section class="filter">
	<Campaign
		initial={initialCampaigns}
		selected={selectedCampaigns}
		update={updateCampaign}
		--block-size="auto"
		--inline-size="auto"
		--font-size="var(--font-size-0)"
	/>

	<Category
		initial={initialCategories}
		selected={selectedCategories}
		update={updateCategory}
		--block-size="auto"
		--inline-size="auto"
		--font-size="var(--font-size-0)"
	/>

	<Interval
		selected={selectedIntervals}
		update={updateInterval}
		--block-size="auto"
		--inline-size="auto"
		--font-size="var(--font-size-0)"
	/>

	<Membership
		initial={initialMemberships}
		selected={selectedMemberships}
		update={updateMembership}
		--block-size="auto"
		--inline-size="auto"
		--font-size="var(--font-size-0)"
	/>
</section>

{#if selectedMembership}
	<section class="selected">
		<SelectedMember membership={selectedMembership} />
	</section>
{/if}

<style>
	.filter {
		display: flex;
		gap: var(--size-2);
	}

	.selected {
		display: grid;
	}
</style>
