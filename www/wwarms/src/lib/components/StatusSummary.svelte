<script lang="ts">
	import { clearerStatus, type Status } from './types';
	import { SubscriptionStatusEmojis } from './emojis';

	type Props = { count: number; status: Record<string, number> };
	let { count, status }: Props = $props();
</script>

<section class="status-summary">
	<header>
		<h2>Overview</h2>
		<small>
			<span>since 1<sup>st</sup></span>
			<span>January</span>
			<span>2024</span>
		</small>
	</header>
	<fieldset class="members">
		<legend>members</legend>
		<p>{new Intl.NumberFormat().format(count)}</p>
	</fieldset>
	<fieldset class="subscriptions">
		<legend>subscriptions</legend>
		<ul>
			{#each Object.entries(status) as [key, value]}
				<li>
					<span>{clearerStatus(key as Status)}&nbsp;{SubscriptionStatusEmojis[key as Status]}</span>
					<span>{new Intl.NumberFormat().format(value)}</span>
				</li>
			{/each}
		</ul>
	</fieldset>
</section>

<style>
	.status-summary {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content;
		gap: var(--gap, var(--size-2));
		block-size: var(--block-size, 100%);
		inline-size: var(--inline-size, auto);
		background-color: var(--bg, white);
	}

	header {
		display: grid;
		place-content: center;
		gap: var(--gap, var(--size-0));
		text-align: center;
		padding-block-start: var(--size-2);
		h2 {
			font-size: var(--h2-font-size, var(--font-size-5));
			color: var(--h2-color, var(--accent));
			font-weight: bold;
			line-height: 1;
		}
		small {
			display: flex;
			justify-content: center;
			color: black;
			gap: var(--gap, var(--size-1));
		}
	}

	legend {
		font-size: var(--legend-font-size, var(--font-size-4));
		padding-inline: var(--size-4);
		color: var(--legend-color, var(--accent));
		background-color: white;
		border: 1px solid var(--accent);
		border-radius: var(--radius-2);

		font-weight: bold;
	}

	fieldset {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap, var(--size-2));
		block-size: var(--block-size, auto);
		inline-size: var(--inline-size, 100%);
		background-color: var(--bg, var(--gray-7));
		color: white;
	}

	.members {
		p {
			place-self: center;
			font-size: var(--p-font-size, var(--font-size-4));
			font-weight: bold;
		}
	}

	.subscriptions {
		ul {
			display: grid;
			grid-template-columns: 1fr;
			place-items: center;
			gap: var(--gap, var(--size-2));
		}
		li {
			display: grid;
			grid-template-columns: 1fr 1fr;
			inline-size: 100%;
			gap: var(--gap, var(--size-4));
			span:nth-of-type(1) {
				text-align: right;
				font-size: var(--span-font-size, var(--font-size-4));
			}
			span:last-of-type {
				font-weight: bold;
				font-size: var(--span-font-size, var(--font-size-4));
			}
		}
	}
</style>
