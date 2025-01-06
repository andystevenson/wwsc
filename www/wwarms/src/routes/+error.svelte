<script lang="ts">
	import { page } from '$app/state';
	import HTTPStatus from '$lib/components/HTTPStatus.svelte';
	let status = $page.status;
	let message = $page.error?.message;
</script>

<HTTPStatus {status} {message} />
