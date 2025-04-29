<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { WWCampaignMembership } from '$lib/components/types';
	import Subscriptions from '$lib/components/Subscriptions.svelte';
	let { data }: { data: PageData } = $props();

	let membership: WWCampaignMembership | null = $state(null);
	function select(m: WWCampaignMembership | null) {
		membership = m;
	}
</script>

<section class="subscriptions">
	<Subscriptions {select} />
	<pre>{JSON.stringify(membership, null, 2)}</pre>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</section>

<style>
	.subscriptions {
		block-size: 100%;
		overflow: hidden;
	}
</style>
