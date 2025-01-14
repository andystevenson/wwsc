<script lang="ts">
	import { GenderTypes } from './types';
	import type { GenderType } from './types';
	import { GenderEmojis } from './emojis';

	type GenderConfig = {
		withIndex?: boolean;
		index?: number;
		prefix?: string;
	};

	type Props = {
		config?: GenderConfig;
		update?: (g: GenderType, checked: boolean, otherValue: string) => void;
	};

	let { config, update }: Props = $props();
	let { withIndex, index, prefix } = config || {};

	let otherSelected = $state(false);
	let otherValue = $state('');

	function doUpdate(e: Event) {
		let target = e.currentTarget as HTMLInputElement;

		if (target.name === 'other') {
			otherValue = target.value;
			if (update) update('other', true, otherValue);
			return;
		}

		let otherElement = target
			.closest('fieldset')
			?.querySelector('input[name="other"]') as HTMLInputElement;
		if (!otherElement) throw new TypeError('other input not found');

		let g = target.value as GenderType;

		if (g === 'other') {
			otherElement.readOnly = false;
			otherSelected = true;
			otherValue = otherElement.value;
			otherElement.tabIndex = 0;
			otherElement.focus();
		}

		if (g !== 'other') {
			otherElement.readOnly = true;
			otherElement.tabIndex = -1;
			otherSelected = false;
			otherValue = '';
		}

		if (update) update(g, target.checked, otherValue);
	}
</script>

{#snippet gender(
	g: GenderType,
	withIndex: boolean = false,
	index: number = 0,
	prefix: string = 'family'
)}
	<label>
		<span>{GenderEmojis[g]}</span>
		<input
			type="radio"
			name={!withIndex ? 'gender' : `${prefix}.${index}.gender`}
			value={g}
			checked={g === 'unknown'}
			onchange={(e) => doUpdate(e)}
		/>
		<span>{g}</span>
	</label>
{/snippet}

<fieldset class="gender">
	<legend>gender</legend>
	{#each GenderTypes as g}
		{@render gender(g, withIndex, index, prefix)}
	{/each}
	<input
		type="text"
		name="other"
		minlength="3"
		readonly={!otherSelected}
		bind:value={otherValue}
		oninput={doUpdate}
		tabindex="-1"
	/>
</fieldset>

<style>
	.gender {
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap, var(--size-2));
		block-size: var(--block-size, min-content);
		inline-size: var(--inline-size, max-content);
	}

	legend {
		font-size: var(--legend-font-size, var(--font-size-2));
	}

	label {
		display: inline-flex;
		align-items: center;
		gap: var(--gap, var(--size-2));

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

	input {
		outline-color: var(--accent);
	}

	[type='radio'] {
		display: none;
	}

	[readonly] {
		cursor: not-allowed;
		background-color: var(--gray-8);
	}
</style>
