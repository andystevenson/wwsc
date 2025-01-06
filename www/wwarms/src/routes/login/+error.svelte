<script lang="ts">
	import { page } from '$app/stores';
	import HttpStatus from '$lib/components/HTTPStatus.svelte';
	let status = $state($page.status);
	let message = $state($page.error?.message || 'unknown error');
</script>

<HttpStatus {status} {message} />
