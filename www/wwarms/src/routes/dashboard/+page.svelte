<script lang="ts">
	import type { PageData } from './$types';
	import Bar from '$lib/components/Charts/Bar.svelte';
	import Doughnut from '$lib/components/Charts/Doughnut.svelte';
	import StatusSummary from '$lib/components/StatusSummary.svelte';
	import { normalize } from '$lib/components/types';
	let { data }: { data: PageData } = $props();

	let categories = $derived(data.categories);
	let campaigns = $derived(normalize(data.campaigns));
	let genders = $derived(normalize(data.genders));
	let status = $derived(normalize(data.status));
	let count = $derived(data.count);
	let ages = $derived(data.ages);
	let payouts = $derived(data.payouts);
</script>

<ul class="charts">
	<li>
		<StatusSummary {count} {status} />
	</li>
	<li>
		<Bar title={'revenue'} dataset={payouts} />
	</li>
	<li>
		<Doughnut title={'age-groups'} dataset={ages} />
	</li>
	<li>
		<Doughnut title={'genders'} dataset={genders} />
	</li>
	<li>
		<Doughnut title={'categories'} dataset={categories} />
	</li>
	<li>
		<Doughnut title={'campaigns'} dataset={campaigns} />
	</li>
</ul>
<pre>{JSON.stringify(payouts, null, 2)}</pre>

<style>
	.charts {
		padding-block-start: var(--size-2);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1rem;
		overflow-y: scroll;

		li:nth-child(2) {
			grid-column: span 2;
		}
	}

	.charts > * {
		overflow: hidden;
		border: 3px solid var(--gray-5);
		border-radius: var(--radius-3);
		background-color: var(--gray-7);
		box-shadow: var(--shadow-2);
	}
</style>
