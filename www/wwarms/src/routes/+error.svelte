<script lang="ts">
	import { page } from '$app/stores';
	import HTTPStatus from '$lib/components/HTTPStatus.svelte';
	let status = $page.status;
	let message = $page.error?.message;
</script>

<HTTPStatus {status} {message} />
