<script lang="ts">
	import {
		type Category as CategoryType,
		type Interval as IntervalType,
		type Status as StatusType
	} from './types';

	import Category from './Category.svelte';
	import Interval from './Interval.svelte';
	import Status from './Status.svelte';

	type SUpdate = (interval: StatusType, checked: boolean) => void;
	type IUpdate = (interval: IntervalType, checked: boolean) => void;
	type CUpdate = (category: CategoryType, checked: boolean) => void;
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

		<Category update={updateCategories} --inline-size="auto" --font-size="var(--font-size-0)" />

		<Interval
			update={updateIntervals}
			--inline-size="auto"
			--block-size="auto"
			--font-size="var(--font-size-0)"
		/>

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
		gap: var(--size-1);
	}

	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);
		padding-inline: var(--size-1);

		legend {
			font-weight: bolder;
		}

		label {
			font-size: var(--font-size-0);
		}
	}

	.filters {
		display: flex;
		gap: var(--size-1);
	}

	label {
		display: inline-flex;
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
			margin-inline-end: var(--size-1);
		}
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
