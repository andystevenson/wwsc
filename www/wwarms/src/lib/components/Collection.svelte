<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { type CollectionMethod, CollectionMethods, clearerCollectionMethod } from './types';
	type IUpdate = (collection: CollectionMethod, checked: boolean) => void;

	type Props = {
		selected?: SvelteSet<CollectionMethod>;
		update?: IUpdate;
	};

	let { selected, update }: Props = $props();

	function doUpdate(e: Event) {
		if (!update) return;
		let checkbox = e.currentTarget as HTMLInputElement;
		let checked = checkbox.checked;
		let c = checkbox.value as CollectionMethod;
		update(c, checked);
	}
</script>

{#snippet collection(c: CollectionMethod)}
	<label>
		<input type="checkbox" onchange={doUpdate} value={c} checked={selected?.has(c)} />
		<span>{clearerCollectionMethod(c)}</span>
	</label>
{/snippet}

<fieldset class="collection">
	<legend>collection</legend>
	{#each CollectionMethods as i}
		{@render collection(i)}
	{/each}
</fieldset>

<style>
	.collection {
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
