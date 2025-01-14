<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { PreferenceTypes } from './types';
	import type { PreferenceType } from './types';

	type PUpdate = (p: PreferenceType, checked: boolean) => void;
	type Props = {
		selected?: SvelteSet<PreferenceType>;
		update?: PUpdate;
	};
	let { selected, update }: Props = $props();

	let all = $state(false);

	function updatePreferences(e: Event) {
		let target = e.currentTarget as HTMLInputElement;
		if (!target.checked) {
			all = false;
		}

		if (update) {
			let p = target.value as PreferenceType;
			update(p, target.checked);
		}
	}

	function updateAllPreferences(e: Event) {
		let target = e.currentTarget as HTMLInputElement;
		let fieldset = target.closest('fieldset') as HTMLFieldSetElement;
		if (!fieldset) throw new TypeError('fieldset not found');
		if (target.checked) {
			let checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');
			checkboxes.forEach((checkbox) => {
				let input = checkbox as HTMLInputElement;
				input.checked = true;
				let value = input.value;
				if (value === 'on') return;
				if (update) update(value as PreferenceType, true);
			});
		}
	}
</script>

{#snippet preference(p: PreferenceType, index: number)}
	<label>
		<input
			type="checkbox"
			name={'preferences.' + index}
			onchange={updatePreferences}
			value={p}
			checked={selected?.has(p)}
		/>
		<span>{p}</span>
	</label>
{/snippet}

<fieldset class="preferences">
	<legend>preferences</legend>
	<label>
		<span>all</span>
		<input type="checkbox" bind:checked={all} onchange={updateAllPreferences} />
	</label>
	{#each PreferenceTypes as p, index}
		{@render preference(p, index)}
	{/each}
</fieldset>

<style>
	.preferences {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		block-size: var(--block-size, min-content);
		inline-size: var(--inline-size, max-content);
	}

	legend {
		font-size: var(--legend-font-size, var(--font-size-2));
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);

		font-size: var(--font-size, var(--font-size-1));

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

	[type='checkbox'] {
		display: none;
	}
</style>
