<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { PreferenceType } from './types';
	import Preferences from './Preferences.svelte';
	import Gender from './Gender.svelte';

	import MembershipFilter from './MembershipFilter.svelte';

	import type { WWCampaignMembership } from './types';
	import NewMember from './NewMember.svelte';

	type MUpdate = (m: WWCampaignMembership | null) => void;
	type Props = {
		select?: MUpdate;
	};

	let { select }: Props = $props();

	let membership: WWCampaignMembership | null = $state(null);
	function doSelect(m: WWCampaignMembership | null) {
		if (select) select(m);
		membership = m;
	}
</script>

<MembershipFilter select={doSelect} />

<NewMember {membership} />
