<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { WWCampaignMembership } from '$lib/components/types';
	import AddMember from '$lib/components/AddMember.svelte';

	let membership: WWCampaignMembership | null = $state(null);
	function select(m: WWCampaignMembership | null) {
		membership = m;
	}
</script>

<section class="add-member">
	<AddMember {select} />
	<pre>{JSON.stringify(membership, null, 2)}</pre>
</section>

<style>
	.add-member {
		block-size: 100%;
		overflow: hidden;
	}
</style>
