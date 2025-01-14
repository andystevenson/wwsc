<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { type Interval, Intervals } from './types';
	type IUpdate = (interval: Interval, checked: boolean) => void;

	type Props = {
		selected?: SvelteSet<Interval>;
		update?: IUpdate;
	};

	let { selected, update }: Props = $props();

	function doUpdate(e: Event) {
		if (!update) return;
		let checkbox = e.currentTarget as HTMLInputElement;
		let checked = checkbox.checked;
		let c = checkbox.value as Interval;
		update(c, checked);
	}
</script>

{#snippet interval(i: Interval)}
	<label>
		<input type="checkbox" onchange={doUpdate} value={i} checked={selected?.has(i)} />
		<span>{i === 'month' ? '📆 ' : '🗓️ '}{i}ly</span>
	</label>
{/snippet}

<fieldset class="interval">
	<legend>interval</legend>
	{#each Intervals as i}
		{@render interval(i)}
	{/each}
</fieldset>

<style>
	.interval {
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap, var(--size-2));
		block-size: var(--block-size, min-content);
		inline-size: var(--inline-size, max-content);
	}

	legend {
		font-size: var(--legend-font-size, var(--font-size-2));
	}

	[type='checkbox'] {
		display: none;
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: var(--gap, var(--size-2));
		font-size: var(--font-size, var(--font-size-2));

		background-color: var(--bg, var(--surface-2));
		block-size: fit-content;
		padding-inline: var(--size-2);
		padding-block: var(--size-1);
		opacity: 0.8;
		border-radius: var(--radius-2);
		white-space: nowrap;
		&:has(:checked) {
			background-color: var(--accent);
		}
	}

	input {
		outline-color: var(--accent);
	}
</style>
