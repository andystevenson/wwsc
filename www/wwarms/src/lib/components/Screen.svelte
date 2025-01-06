<script lang="ts">
</script>

<div class="screen"></div>

<style>
	.screen {
		position: fixed;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		height: 100vh;
		width: 100vw;
		background-image: var(--screen, url('/favicon.svg'));
		background-position: center;
		background-size: auto;
		opacity: var(--opacity, 0.5);
		z-index: var(--z-index, -999999);
	}
</style>
