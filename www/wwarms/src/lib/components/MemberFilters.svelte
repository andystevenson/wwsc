<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type {
		Category as CategoryType,
		Interval as IntervalType,
		Status as StatusType,
		WWActiveCampaign,
		ID
	} from './types';

	import Campaign from './Campaign.svelte';
	import Category from './Category.svelte';
	import Interval from './Interval.svelte';
	import Status from './Status.svelte';
	import { page } from '$app/state';
	let { data } = page;

	type SUpdate = (interval: StatusType, checked: boolean) => void;
	type CUpdate = (campaign: ID, checked: boolean) => void;
	type IUpdate = (interval: IntervalType, checked: boolean) => void;
	type CatUpdate = (category: CategoryType, checked: boolean) => void;

	type Props = {
		activeCampaigns: WWActiveCampaign[];
		updateSearch: (search: string) => void;
		updateCampaigns: CUpdate;
		updateStatus: SUpdate;
		updateIntervals: IUpdate;
		updateCategories: CatUpdate;
	};

	let {
		activeCampaigns,
		updateSearch,
		updateCampaigns,
		updateStatus,
		updateIntervals,
		updateCategories
	}: Props = $props();

	let initialCampaigns = new SvelteSet<string>([...activeCampaigns.map((c) => c.id)]);

	function handleKeydown(e: KeyboardEvent) {
		if (e.altKey && e.code === 'KeyN') document.getElementById('add')?.click();
	}
</script>

<svelte:window onkeydowncapture={handleKeydown} />
<section>
	<header>
		<input
			class="search"
			type="search"
			oninput={(e) => updateSearch(e.currentTarget.value)}
			placeholder="Search..."
		/>
		<form action="/add">
			<button id="add" class="add">
				<i class="bi bi-plus-circle"></i>
				<span>add member</span>
				<i class="bi bi-option">&nbsp;N</i>
			</button>
		</form>
	</header>

	<section class="filters">
		<Status
			update={updateStatus}
			--inline-size="auto"
			--block-size="auto"
			--font-size="var(--font-size-0)"
		/>

		<Campaign
			initial={initialCampaigns}
			update={updateCampaigns}
			--block-size="auto"
			--inline-size="auto"
			--font-size="var(--font-size-0)"
		/>
		<Interval
			update={updateIntervals}
			--inline-size="auto"
			--block-size="auto"
			--font-size="var(--font-size-0)"
		/>
	</section>
	<section class="filters">
		<Category update={updateCategories} --inline-size="auto" --font-size="var(--font-size-0)" />
	</section>
</section>

<style>
	input {
		outline-color: var(--accent);
		&:focus-visible {
			scale: 0.99 1;
		}
	}

	button {
		color: var(--text-1);
		inline-size: 100%;
		outline-color: var(--accent);
		font-size: var(--font-size-2);
		&:focus-visible {
			scale: 0.96 1;
		}

		span {
			white-space: nowrap;
		}
	}

	header {
		inline-size: 100%;
		margin-block-start: var(--size-2);
		display: grid;
		grid-template-columns: 4fr 1fr;
		gap: var(--size-2);
	}
	section {
		display: grid;
	}

	.filters {
		display: flex;
		gap: var(--size-1);
	}

	.search {
		font-size: var(--font-size-2);
		padding-inline: var(--size-2);
		padding-block: var(--size-1);
		border-radius: var(--radius-2);
		border: 2px solid var(--gray-6);
	}

	.bi-plus-circle {
		font-size: var(--font-size-4);
	}

	.bi-option {
		font-style: normal;
		font-size: var(--font-size-0);
		border: 1px solid var(--gray-6);
		border-radius: var(--radius-2);
		padding-inline: var(--size-1);
		white-space: nowrap;
		opacity: 0.5;
	}
</style>
