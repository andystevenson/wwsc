<script lang="ts">
	import {
		type Category,
		type Interval,
		type Status,
		Intervals,
		Categories,
		SubscriptionStatus
	} from './types';
	import { SubscriptionStatusEmojis } from './emojis';
	type SUpdate = (interval: Status, checked: boolean) => void;
	type IUpdate = (interval: Interval, checked: boolean) => void;
	type CUpdate = (category: Category, checked: boolean) => void;
	type PUpdate = (start: number, end: number) => [number, number];

	type Props = {
		updateSearch: (search: string) => void;
		updateStatus: SUpdate;
		updateIntervals: IUpdate;
		updateCategories: CUpdate;
		updatePrices: PUpdate;
	};

	let { updateStatus, updateSearch, updateIntervals, updateCategories, updatePrices }: Props =
		$props();

	function processPrices(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		let fromElement = document.getElementById('from') as HTMLInputElement;
		let toElement = document.getElementById('to') as HTMLInputElement;
		let [from, to] = [parseFloat(fromElement.value), parseFloat(toElement.value)];
		[from, to] = updatePrices(from, to);
		fromElement.value = from.toString();
		toElement.value = to.toString();
	}
</script>

{#snippet status(s: Status, update: SUpdate)}
	<label>
		<input type="checkbox" onchange={(e) => update(s, e.currentTarget.checked)} value={s} />
		<span>{SubscriptionStatusEmojis[s]} {s}</span>
	</label>
{/snippet}

{#snippet interval(i: Interval, update: IUpdate)}
	<label>
		<input type="checkbox" onchange={(e) => update(i, e.currentTarget.checked)} value={i} />
		<span>{i}ly</span>
	</label>
{/snippet}

{#snippet category(c: Category, update: CUpdate)}
	<label>
		<input type="checkbox" onchange={(e) => update(c, e.currentTarget.checked)} value={c} />
		<span>{c}</span>
	</label>
{/snippet}

<section>
	<input
		type="search"
		oninput={(e) => updateSearch(e.currentTarget.value)}
		placeholder="Search..."
	/>
	<section class="filters">
		<fieldset class="status">
			<legend>status</legend>
			{#each SubscriptionStatus as i}
				{@render status(i, updateStatus)}
			{/each}
		</fieldset>
		<fieldset class="interval">
			<legend>interval</legend>
			{#each Intervals as i}
				{@render interval(i, updateIntervals)}
			{/each}
		</fieldset>

		<fieldset class="category">
			<legend>category</legend>
			{#each Categories as c}
				{@render category(c, updateCategories)}
			{/each}
		</fieldset>
		<fieldset class="price">
			<legend>price</legend>
			<label>
				<span>from&nbsp;</span>
				<input
					type="number"
					id="from"
					onchange={(e) => processPrices(e)}
					value="-1"
					min="-1.00"
					max="1000"
					step="0.5"
				/>
			</label>
			<label>
				<span>to&nbsp;&nbsp;</span>
				<input
					type="number"
					id="to"
					onchange={(e) => processPrices(e)}
					value="-1"
					min="-1.00"
					max="1000"
					step="0.5"
				/>
			</label>
		</fieldset>
	</section>
</section>

<style>
	section {
		margin-block-start: var(--size-2);
		display: grid;
		gap: var(--size-1);
	}

	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);

		legend {
			font-weight: bolder;
		}

		&.interval {
			display: grid;
			place-items: center;
		}
	}

	.filters {
		display: flex;
		gap: var(--size-1);
	}

	label {
		[type='checkbox'] {
			display: none;
		}
		block-size: fit-content;
		background-color: var(--surface-2);
		padding-inline: var(--size-2);
		padding-block: var(--size-1);
		opacity: 0.8;
		border-radius: var(--radius-2);
		white-space: nowrap;
		&:has(:checked) {
			background-color: var(--accent);
		}
	}

	.price {
		input {
			inline-size: 10ch;
			text-align: right;
		}
		span {
			display: inline-block;
			inline-size: 5ch;
			border: 2px solid var(--gray-6);
			border-radius: var(--radius-2);
			padding-inline: var(--size-1);
		}
	}
</style>
