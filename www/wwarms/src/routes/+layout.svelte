<script lang="ts">
	import Screen from '$lib/components/Screen.svelte';
	import MainMenu from '$lib/components/MainMenu.svelte';

	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	let { data, children }: { data: LayoutServerData; children: Snippet<[]> } = $props();
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Screen />

<main>
	<aside>
		<MainMenu user={data.user} />
	</aside>
	<section class="content">
		{#if children}
			{@render children()}
		{/if}
	</section>
</main>

<style>
	:global {
		@import '../lib/css/styles.css';
	}
	main {
		margin: 0 auto;
		max-width: min(2560px, 98vw);
		display: grid;
		grid-template-columns: min-content 1fr;
		grid-template-rows: 1fr;
		max-block-size: 100vh;
		overflow: hidden;
		> * {
			overflow-y: scroll;
			block-size: 100vh;
		}
	}

	aside {
		display: grid;
	}

	.content {
		block-size: 100%;
	}
</style>
