<script lang="ts">
	import type { PageData } from './$types';

	import Collection from '$lib/components/Collection.svelte';
	import PaymentStatus from '$lib/components/PaymentStatus.svelte';
	let { data }: { data: PageData } = $props();
</script>

<Collection />
<PaymentStatus />
