<script lang="ts">
	import type { PageData } from './$types';
	import { SvelteSet } from 'svelte/reactivity';
	import Doughnut from '$lib/components/Charts/Doughnut.svelte';
	import Campaign from '$lib/components/Campaign.svelte';
	import { normalize } from '$lib/components/types';
	let { data }: { data: PageData } = $props();

	let memberships = $derived(normalize(data.memberships));
	let actives = $derived(normalize(data.actives));
	let campaigns = $derived(data.campaigns);

	type SelectedCampaign = (typeof campaigns)[0];
	let campaign = $state('');

	let activeCampaigns = data.campaigns.filter((c) => c.active).map((c) => c.id);
	let initialCampaigns = new SvelteSet<string>([...activeCampaigns]);

	let selectedCampaigns = new SvelteSet<string>();
	function updateCampaign(c: string, checked: boolean) {
		selectedCampaigns.clear();
		campaign = '';
		if (checked) {
			campaign = c;
			selectedCampaigns.add(c);
		}
	}
</script>

<Campaign
	initial={initialCampaigns}
	selected={selectedCampaigns}
	update={updateCampaign}
	--block-size="auto"
	--inline-size="auto"
	--font-size="var(--font-size-0)"
/>

<ul class="charts">
	<li>
		<Doughnut title={'all-actives'} dataset={actives} />
	</li>
	<li>
		<Doughnut title={'all-memberships'} dataset={memberships} />
	</li>
</ul>

<style>
	.charts {
		padding-block-start: var(--size-2);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1rem;
		overflow-y: scroll;

		/* li:first-child {
			grid-column: span 2;
		} */
	}

	.charts > * {
		overflow: hidden;
		border: 3px solid var(--gray-5);
		border-radius: var(--radius-3);
		background-color: var(--gray-7);
		box-shadow: var(--shadow-2);
	}
</style>
