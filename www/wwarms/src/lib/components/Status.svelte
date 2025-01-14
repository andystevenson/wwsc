<script lang="ts">
	import { type Status, SubscriptionStatus, clearerStatus } from './types';
	import { SubscriptionStatusEmojis } from './emojis';
	type IUpdate = (interval: Status, checked: boolean) => void;

	type Props = {
		update?: IUpdate;
	};

	let { update }: Props = $props();

	function doUpdate(e: Event) {
		if (!update) return;
		let checkbox = e.currentTarget as HTMLInputElement;
		let checked = checkbox.checked;
		let c = checkbox.value as Status;
		update(c, checked);
	}
</script>

{#snippet status(s: Status)}
	<label>
		<input type="checkbox" onchange={doUpdate} value={s} checked={s === 'active'} />
		<span>{SubscriptionStatusEmojis[s]} {clearerStatus(s)}</span>
	</label>
{/snippet}

<fieldset class="status">
	<legend>status</legend>
	{#each SubscriptionStatus as s}
		{@render status(s)}
	{/each}
</fieldset>

<style>
	.status {
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
