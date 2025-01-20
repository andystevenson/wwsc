<script lang="ts">
	import type { WWMember } from './types';
	import { GenderEmojis, SubscriptionStatusEmojis } from './emojis';
	import { gbp } from '$lib/utilities';
	let { members }: { members: WWMember[] } = $props();

	function formatPrice(member: WWMember) {
		if (member.category === 'family' && member.price === 0) return 'inclusive';
		if (member.category === 'hockey' && !member.name?.includes('HockeyClub')) return 'inclusive';
		if (member.category === 'cricket' && !member.name?.includes('CricketClub')) return 'inclusive';
		if (member.price === 0) return 'free';
		return gbp(member.price);
	}
</script>

{#snippet member(m: WWMember)}
	<li>
		<span class="id" hidden>{m.id}</span>
		<span class="status">{SubscriptionStatusEmojis[m.status]}</span>
		<span class="gender">{GenderEmojis[m.gender]}</span>
		<span class="name">{m.name}</span>
		<span class="email">
			<a href="mailto:{m.email?.toLocaleLowerCase()}">{m.email?.toLocaleLowerCase()}</a>
		</span>
		<span class="mobile">
			<a href="tel:{m.mobile}">{m.mobile}</a>
		</span>
		<span class="category">{m.category}</span>
		<span class="interval">{m.interval}ly</span>
		<span class="price">{formatPrice(m)}</span>
	</li>
{/snippet}

<section>
	<ul>
		{#each members as m}
			{@render member(m)}
		{/each}
	</ul>
</section>

<style>
	section {
		overflow-y: scroll;
		overflow-x: hidden;
	}

	ul {
		list-style-type: none;
		padding: 0;
		overflow-x: scroll;
	}

	li {
		--_status: 2fr;
		--_gender: 3fr;
		--_name: 27fr;
		--_email: 35fr;
		--_mobile: 18fr;
		--_category: 12fr;
		--_interval: 7fr;
		--_price: 9fr;

		--_layout: var(--_status) var(--_gender) var(--_name) var(--_email) var(--_mobile)
			var(--_category) var(--_interval) var(--_price);
		padding: 0;
		margin: 0;
		max-inline-size: unset;
		background-color: var(--surface-1);
		display: grid;
		grid-template-columns: var(--_layout);

		gap: var(--size-1);
		opacity: 0.8;
		overflow: hidden;

		&:hover {
			opacity: 1;
			background-color: var(--surface-3);
		}
	}

	span {
		white-space: nowrap;
		overflow-y: scroll;
	}

	a {
		color: var(--text-1);
		text-decoration: none;
	}

	.name {
		font-weight: bold;
	}

	.price {
		text-align: right;
	}
</style>
