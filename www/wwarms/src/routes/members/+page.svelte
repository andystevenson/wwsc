<script lang="ts">
	import type { PageData } from './$types';
	import MemberList from '$lib/components/MemberList.svelte';
	import MemberFilters from '$lib/components/MemberFilters.svelte';
	import type { WWMember, Category, Interval, Status } from '$lib/components/types';
	import { SvelteSet } from 'svelte/reactivity';
	let { data }: { data: PageData } = $props();

	let search = $state('');
	let intervalFilters = new SvelteSet<Interval>();
	let categoryFilters = new SvelteSet<Category>();
	let statusFilters = new SvelteSet<Status>();
	let priceFilters = $state<[number, number]>([-1, -1]);

	$inspect(statusFilters);
	$inspect(intervalFilters);
	let filteredMembers = $derived.by(() => {
		// no filters then everything
		if (
			!search &&
			!statusFilters.size &&
			!intervalFilters.size &&
			!categoryFilters.size &&
			priceFilters[0] === -1
		)
			return data.members;
		return data.members.filter(
			(member: WWMember) =>
				inStatus(member) &&
				inInterval(member) &&
				inCategory(member) &&
				inPrice(member) &&
				inSearch(member)
		);
	});

	function inStatus(member: WWMember) {
		return statusFilters.size === 0 || statusFilters.has(member.status);
	}

	function inInterval(member: WWMember) {
		return intervalFilters.size === 0 || intervalFilters.has(member.interval);
	}

	function inCategory(member: WWMember) {
		return categoryFilters.size === 0 || categoryFilters.has(member.category);
	}

	function inPrice(member: WWMember) {
		return (
			priceFilters[0] === -1 || (member.price >= priceFilters[0] && member.price <= priceFilters[1])
		);
	}

	function inSearch(member: WWMember) {
		const lsearch = search.toLowerCase();
		const lname = member.name?.toLowerCase();
		return !search || lname?.includes(lsearch);
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

	function updatePrices(start: number, end: number): [number, number] {
		let [from, to] = [start, end];
		if (end < start) [from, to] = [start, start];
		priceFilters = [from, to];
		return [from, to];
	}
</script>

<section>
	<MemberFilters
		{updateSearch}
		{updateIntervals}
		{updateCategories}
		{updatePrices}
		{updateStatus}
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
