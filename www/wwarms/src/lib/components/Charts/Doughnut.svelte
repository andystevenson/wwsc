<script lang="ts">
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	Chart.register(ChartDataLabels);

	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = $state(null);

	type Props = {
		dataset: Record<string, number>;
	};

	let { dataset }: Props = $props();

	onMount(async () => {
		canvas = document.getElementById('chart') as HTMLCanvasElement;
		if (!canvas) throw new TypeError('Canvas not found');
		chart = new Chart(canvas, {
			type: 'doughnut',
			options: {
				plugins: {
					legend: {
						display: false
					},
					title: {
						display: true,
						font: {
							size: 20
						},
						text: 'memberships'
					},
					tooltip: {
						enabled: true
					},
					datalabels: {
						formatter: function (value, context) {
							let chart = context.chart;
							let data = chart.data;
							let labels = data.labels;
							if (!labels) return value;
							if (+value < 10) return value;
							return `${labels[context.dataIndex]}\n${value}`;
						},
						anchor: 'center',
						backgroundColor: null,
						borderWidth: 0,
						color: 'var(--accent)',
						font: {
							weight: 'bold'
						}
					}
				}
			},
			data: {
				labels: Object.keys(dataset),
				datasets: [
					{
						data: Object.values(dataset)
					}
				]
			}
		});
	});
</script>

<section class="chart">
	<canvas bind:this={canvas} id="chart"></canvas>
</section>

<style>
	.chart {
		aspect-ratio: 1;
	}
</style>
