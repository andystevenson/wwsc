<script lang="ts">
	import { dayjs } from '@wwsc/lib-dates';
	import type { WWCampaignMembership } from './types';

	type Props = {
		membership: WWCampaignMembership | null;
	};
	let { membership }: Props = $props();
</script>

{#if membership}
	<section class="membership">
		<p class="description">
			{`${membership.description} / ${membership.category} / ${membership.membershipDescription}`.toLowerCase()}
		</p>
		{#if !membership.end.startsWith('9999')}
			<p class="campaign-dates">
				{`offer starts ${dayjs(membership.start).format('dddd Do, MMMM YYYY')},  ends ${dayjs(membership.end).format('dddd Do, MMMM YYYY')}`}
			</p>
		{/if}
	</section>
{/if}

<style>
	.membership {
		margin-block-start: var(--size-2);
		display: grid;
		gap: var(--size-0);
		justify-items: center;
		font-weight: bold;
	}
	.description {
		font-size: var(--font-size-3);
		max-inline-size: unset;
	}

	.campaign-dates {
		font-size: var(--font-size-0);
		color: var(--accent);
	}
</style>
