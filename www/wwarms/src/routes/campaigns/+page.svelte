<script lang="ts">
	import type { PageData } from './$types';
	import Doughnut from '$lib/components/Charts/Doughnut.svelte';
	let { data }: { data: PageData } = $props();
	let dataset: Record<string, number> = $derived(
		data.memberships
			.toSorted((a, b) => b.count - a.count)
			.reduce(
				(dataset, next) => {
					let { campaign, count } = next;
					dataset[campaign] = count;
					return dataset;
				},
				{} as Record<string, number>
			)
	);
</script>

<section class="charts">
	<Doughnut {dataset} />
</section>

<style>
	.charts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
		gap: 1rem;
	}
</style>
