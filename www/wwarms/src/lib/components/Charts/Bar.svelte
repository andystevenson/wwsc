<script lang="ts">
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import type { Context } from 'chartjs-plugin-datalabels';
	import { dayjs } from '@wwsc/lib-dates';

	import { nanoid } from 'nanoid';

	import { onMount, tick } from 'svelte';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = $state(null);
	let id = $state(nanoid());

	type Props = {
		title?: string;
		dataset: { month: string; total: number }[];
	};

	let { title = 'dataset', dataset }: Props = $props();

	function draw() {
		canvas = document.getElementById(id) as HTMLCanvasElement;
		if (!canvas) throw new TypeError('Canvas not found');
		chart = new Chart(canvas, {
			type: 'bar',
			plugins: [ChartDataLabels],
			options: {
				onResize: function (chart) {
					tick().then(() => {
						draw();
					});
					tick().then(() => {
						draw();
					});
				},
				responsive: true,
				scales: {
					x: {
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'white'
						}
					},
					y: {
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'white'
						}
					}
				},
				plugins: {
					datalabels: {
						//@ts-ignore
						backgroundColor: 'white',
						borderColor: 'black',
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
						formatter: new Intl.NumberFormat('en-GB', {
							currency: 'GBP',
							style: 'currency',
							maximumFractionDigits: 0
						}).format
					},
					legend: {
						display: false,
						position: 'bottom',
						title: {
							display: true,
							color: 'white',
							text: 'Total'
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
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						borderColor: 'white',
						borderWidth: 2,
						displayColors: false,
						bodyColor: 'white',
						bodyAlign: 'center',
						position: 'nearest',
						padding: 6,
						titleAlign: 'center'
					}
				}
			},
			data: {
				labels: dataset.map((data) => dayjs(data.month).format('MMM')),
				datasets: [
					{
						data: dataset.map((data) => data.total),
						label: title,
						backgroundColor: 'orange',
						datalabels: {
							anchor: 'end'
						}
					}
				]
			}
		});
	}

	onMount(() => {
		chart?.destroy();
		draw();
	});
</script>

<section class="chart-container">
	<canvas
		bind:this={canvas}
		onclick={() => {
			// chart?.data.datasets[0].data = Object.values(sortDataset(dataset));
			chart?.reset();
			chart?.resize();
			chart?.update();
		}}
		{id}
	></canvas>
</section>

<style>
	.chart-container {
		position: relative;
	}
</style>
