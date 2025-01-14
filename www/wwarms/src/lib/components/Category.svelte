<script lang="ts">
	import type { SvelteSet } from 'svelte/reactivity';
	import { type Category, Categories } from './types';
	type CUpdate = (category: Category, checked: boolean) => void;

	type Props = {
		initial?: SvelteSet<Category>;
		selected?: SvelteSet<Category>;
		update?: CUpdate;
	};

	let { initial, selected, update }: Props = $props();

	function doUpdate(e: Event) {
		if (!update) return;
		let checkbox = e.currentTarget as HTMLInputElement;
		let checked = checkbox.checked;
		let c = checkbox.value as Category;
		update(c, checked);
	}
</script>

{#snippet category(c: Category)}
	<label>
		<input type="checkbox" onchange={doUpdate} value={c} checked={selected?.has(c)} />
		<span>{c}</span>
	</label>
{/snippet}

<fieldset class="category">
	<legend>category</legend>
	{#each [...(initial || Categories)].sort() as c}
		{@render category(c)}
	{/each}
</fieldset>

<style>
	.category {
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
