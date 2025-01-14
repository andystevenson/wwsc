<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
</script>

<form method="post" use:enhance>
	<div>
		<h1>Goodbye!</h1>
		<img src={data.user?.image} alt="west warwicks icon of a bear" />
	</div>
	<button><i class="bi bi-box-arrow-left"></i><span>logout</span></button>
</form>

<style>
	form {
		place-items: center;
		block-size: 100%;
		display: grid;
		background-image: url('/tree.jpg');
		background-size: cover;
		background-position: center;

		button {
			color: var(--text-1);
			font-size: var(--font-size-4);
			opacity: 0.6;
		}
	}
	div {
		display: grid;
		place-items: center;
		h1 {
			opacity: 0.6;
		}
		img {
			block-size: 100px;
			inline-size: 100px;
			border-radius: var(--radius-round);
			opacity: 0.6;
		}
	}

	.bi {
		font-size: var(--font-size-6);
		padding-right: var(--size-2);
	}
</style>
