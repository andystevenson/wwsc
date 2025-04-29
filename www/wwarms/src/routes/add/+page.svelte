<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { ActionReturn } from 'svelte/action';
	import type { WWCampaignMembership } from '$lib/components/types';
	import MembershipFilter from '$lib/components/MembershipFilter.svelte';
	import NewMember from '$lib/components/NewMember.svelte';

	let { form } = $props();
	let membership: WWCampaignMembership | null = $state(null);

	function select(m: WWCampaignMembership | null) {
		membership = m;
	}
</script>

<section class="add-member">
	<MembershipFilter {select} />

	{#if membership?.scope === 'individual'}
		<NewMember {form} {membership} />
	{/if}
</section>

<style>
	.add-member {
		block-size: 100%;
		/* overflow: hidden; */
	}
</style>
