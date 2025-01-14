<script lang="ts">
	import type { WWFamilyMember } from './types';
	import { GenderEmojis, SubscriptionStatusEmojis, GenderTypes } from './emojis';
	let { members }: { members: WWFamilyMember[] } = $props();
</script>

{#snippet member(m: WWFamilyMember)}
	<li>
		<label>
			<span>first name</span>
			<input type="text" name="family.0.firstName" required />
		</label>
		<label>
			<span>surname</span>
			<input type="text" name="family.0.surname" />
		</label>
		<label>
			<span>dob</span>
			<input type="date" name="family.0.dob" required />
		</label>
		<label>
			<span>email</span>
			<input type="email" name="family.0.email" />
		</label>
		<fieldset class="gender">
			<legend>gender</legend>
			{#each GenderTypes as g}
				{@render gender(g)}
			{/each}
			<input type="text" name="other" minlength="3" />
		</fieldset>
	</li>
{/snippet}

<section>
	<fieldset class="family-list">
		<legend>family</legend>
		<button type="button">add</button>
		<ul>
			<li>
				<label>
					<span>first name</span>
					<input type="text" name="family.0.firstName" required />
				</label>
				<label>
					<span>surname</span>
					<input type="text" name="family.0.surname" />
				</label>
				<label>
					<span>dob</span>
					<input type="date" name="family.0.dob" required />
				</label>
				<label>
					<span>email</span>
					<input type="email" name="family.0.email" />
				</label>
				<fieldset class="gender">
					<legend>gender</legend>
					{#each GenderTypes as g}
						{@render gender(g)}
					{/each}
					<input type="text" name="other" minlength="3" />
				</fieldset>
			</li>
		</ul>
	</fieldset>
</section>

<style>
	section {
		overflow-y: scroll;
		overflow-x: hidden;
	}

	ul {
		list-style-type: none;
		padding: 0;
		overflow-x: scroll;
	}

	li {
		--_status: 2fr;
		--_gender: 3fr;
		--_name: 27fr;
		--_email: 35fr;
		--_mobile: 18fr;
		--_category: 12fr;
		--_interval: 7fr;
		--_price: 9fr;

		--_layout: var(--_status) var(--_gender) var(--_name) var(--_email) var(--_mobile)
			var(--_category) var(--_interval) var(--_price);
		padding: 0;
		margin: 0;
		max-inline-size: unset;
		background-color: var(--surface-1);
		display: grid;
		grid-template-columns: var(--_layout);

		gap: var(--size-1);
		opacity: 0.8;
		overflow: hidden;

		&:hover {
			opacity: 1;
			background-color: var(--surface-3);
		}
	}

	span {
		white-space: nowrap;
		overflow-y: scroll;
	}

	a {
		color: var(--text-1);
		text-decoration: none;
	}

	.name {
		font-weight: bold;
	}

	.price {
		text-align: right;
	}
</style>
