<script lang="ts">
	import { HTTPemojis } from './emojis';

	type Props = {
		status: number;
		message?: string;
	};

	type Index = keyof typeof HTTPemojis;
	let { status, message }: Props = $props();
	let httpEmoji = HTTPemojis[status as Index] ?? HTTPemojis[500];
	let [emojis, description] = httpEmoji;
	if (message === `Error: ${status}`) message = description;
</script>

<section>
	<span>{emojis}</span>
	<h1>{message ? message : description}<sup>&nbsp;&nbsp;{status}</sup></h1>
</section>

<style>
	section {
		background-color: var(--surface-1, black);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1em;
		height: var(--height, 100vh);
		width: var(--width, 100vw);
	}

	span {
		font-size: var(--font-size, 5em);
	}

	sup {
		font-size: var(--sup-font-size, calc(var(--font-size, 5em) * 0.05));
		opacity: var(--opacity, 0.25);
	}
</style>
