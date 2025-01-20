<script lang="ts">
	import type { SvelteSet } from 'svelte/reactivity';
	import { type PaymentStatus, PaymentStatuses } from './types';
	type PSUpdate = (paymentStatus: PaymentStatus, checked: boolean) => void;

	type Props = {
		initial?: SvelteSet<PaymentStatus>;
		selected?: SvelteSet<PaymentStatus>;
		update?: PSUpdate;
	};

	let { initial, selected, update }: Props = $props();

	function doUpdate(e: Event) {
		if (!update) return;
		let checkbox = e.currentTarget as HTMLInputElement;
		let checked = checkbox.checked;
		let c = checkbox.value as PaymentStatus;
		update(c, checked);
	}
</script>

{#snippet paymentStatus(ps: PaymentStatus)}
	<label>
		<input type="checkbox" onchange={doUpdate} value={ps} checked={selected?.has(ps)} />
		<span>{ps}</span>
	</label>
{/snippet}

<fieldset class="paymentStatus">
	<legend>paymentStatus</legend>
	{#each [...(initial || PaymentStatuses)].sort() as ps}
		{@render paymentStatus(ps)}
	{/each}
</fieldset>

<style>
	.paymentStatus {
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
