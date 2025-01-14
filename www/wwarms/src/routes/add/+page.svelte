<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { WWCampaignMembership } from '$lib/components/types';
	import AddMember from '$lib/components/AddMember.svelte';

	let membership: WWCampaignMembership | null = $state(null);
	$inspect(membership);
	function select(m: WWCampaignMembership | null) {
		membership = m;
	}
</script>

<AddMember {select} />

<pre>{JSON.stringify(membership, null, 2)}</pre>
