<script lang="ts">
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import type { Context } from 'chartjs-plugin-datalabels';

	import { nanoid } from 'nanoid';

	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = $state(null);
	let id = $state(nanoid());

	type Props = {
		title?: string;
		dataset: Record<string, number>;
	};

	function sortDataset(dataset: Record<string, number>) {
		return Object.fromEntries(Object.entries(dataset).sort((a, b) => b[1] - a[1]));
	}
	let { title = 'dataset', dataset }: Props = $props();

	onMount(async () => {
		canvas = document.getElementById(id) as HTMLCanvasElement;
		if (!canvas) throw new TypeError('Canvas not found');
		chart = new Chart(canvas, {
			type: 'doughnut',
			plugins: [ChartDataLabels],
			options: {
				plugins: {
					datalabels: {
						//@ts-ignore
						backgroundColor: function (context: Context) {
							return context.dataset.backgroundColor;
						},
						borderColor: 'white',
						borderRadius: 25,
						borderWidth: 2,
						color: 'black',
						display: function (context: Context) {
							let dataset = context.dataset;
							let value = dataset.data[context.dataIndex];
							if (typeof value !== 'number') return false;
							return value > 9;
						},
						font: {
							weight: 'bold'
						},
						padding: 6,
						formatter: Math.round
					},
					legend: {
						position: 'bottom',
						labels: {
							boxWidth: 20,
							color: 'white'
						}
					},
					title: {
						display: true,
						color: 'white',
						font: {
							size: 20
						},
						text: title
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.1)',
						borderColor: 'white',
						borderWidth: 2,
						displayColors: false,
						bodyColor: 'white',
						bodyAlign: 'center',
						padding: 6,
						titleFont: {
							weight: 'bold'
						}
					}
				}
			},
			data: {
				labels: Object.keys(sortDataset(dataset)),
				datasets: [
					{
						data: Object.values(sortDataset(dataset)),
						datalabels: {
							anchor: 'end'
						}
					}
				]
			}
		});
	});
</script>

<section class="chart">
	<canvas
		bind:this={canvas}
		onclick={() => {
			// chart?.data.datasets[0].data = Object.values(sortDataset(dataset));
			chart?.reset();
			chart?.update();
		}}
		{id}
	></canvas>
</section>

<style>
	.chart {
		aspect-ratio: 1;
	}
</style>
