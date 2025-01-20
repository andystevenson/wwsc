<script lang="ts">
	import { type Category as CategoryType } from '$lib/components/types';

	import Category from '$lib/components/Category.svelte';

	type CUpdate = (category: CategoryType, checked: boolean) => void;

	type Props = {
		updateCategories: CUpdate;
	};

	let { updateCategories }: Props = $props();
</script>

<section>
	<section class="filters">
		<Category update={updateCategories} --inline-size="auto" --font-size="var(--font-size-0)" />
	</section>
</section>

<style>
	section {
		display: grid;
		gap: var(--size-1);
	}

	.filters {
		display: flex;
		gap: var(--size-1);
	}
</style>
