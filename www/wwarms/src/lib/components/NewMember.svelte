<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { enhance } from '$app/forms';
	import type { WWCampaignMembership, PreferenceType } from './types';
	import Preferences from './Preferences.svelte';
	import Gender from './Gender.svelte';
	import { dayjs } from '@wwsc/lib-dates';
	type Props = {
		membership: WWCampaignMembership | null;
		form?: any;
	};

	let { membership, form }: Props = $props();

	let preferences = new SvelteSet<PreferenceType>(['email-marketing', 'sms-marketing']);
	function updatePreference(p: PreferenceType, checked: boolean) {
		checked ? preferences.add(p) : preferences.delete(p);
	}

	let today = $derived.by(() => dayjs().format('YYYY-MM-DD'));
</script>

{#if membership}
	<form action="?/addMember" method="POST" autocomplete="off" use:enhance>
		<fieldset class="member">
			<legend>existing</legend>
			<input type="hidden" name="campaign" value={membership?.campaign} />
			<input type="hidden" name="category" value={membership?.category} />
			<input type="hidden" name="membership" value={membership?.membership} />
			<label>
				<span>first name</span>
				<input type="text" name="firstName" />
				{#if form?.missing.firstName}
					<p>{form?.missing.firstName}</p>
				{/if}
			</label>
			<label>
				<span>surname</span>
				<input type="text" name="surname" />
			</label>
			<label>
				<span>email</span>
				<input type="email" name="email" />
			</label>
		</fieldset>
		<section class="birthday">
			<fieldset>
				<legend>date of birth</legend>
				<input type="date" name="dob" min="1925-01-01" max={today} />
			</fieldset>
			<Gender --inline-size="auto" />
		</section>
		<!-- only show if non-paying -->
		<fieldset class="contact">
			<legend>contact</legend>

			<section class="address">
				<span>address</span>
				<input type="text" name="line1" />
				<input type="text" name="line2" />
				<input type="text" name="city" />
				<section class="phone">
					<label>
						<span>postcode</span>
						<input type="text" name="postcode" />
					</label>
					<label>
						<span>mobile</span>
						<input type="tel" name="mobile" />
					</label>
				</section>
			</section>
		</fieldset>

		<!-- only show if member is playing sports -->
		{#if membership?.sports}
			<Preferences selected={preferences} update={updatePreference} --inline-size="auto" />
		{/if}
		<section class="submit">
			<button type="submit">add member</button>
			<button type="reset">clear</button>
		</section>
		<pre>form ...{JSON.stringify(form, null, 2)}...</pre>
	</form>
{/if}

{#if !membership}
	<section class="choose">
		<h2>💁‍♂️ first select a membership</h2>
		<h3>to add a new member</h3>
	</section>
{/if}

<style>
	input {
		outline-color: var(--accent);
		&:user-invalid {
			background-color: red;
		}
	}

	label:has([type='text'], [type='email'], [type='tel'], [type='date']) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-2);
		> input {
			flex-grow: 1;
		}
		span {
			white-space: nowrap;
			opacity: 0.8;
		}
	}

	.member {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--size-2);
	}

	.birthday {
		display: grid;
		grid-template-columns: max-content 5fr;
		gap: var(--size-2);
	}

	.contact {
		display: grid;
		gap: var(--size-2);
	}

	.address {
		display: grid;
		gap: var(--size-2);
	}

	.phone {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: var(--size-2);
	}

	.choose {
		display: grid;
		place-content: center;
		height: 90%;
		background-color: var(--surface-2);
		h2,
		h3 {
			text-align: center;
			max-inline-size: unset;
		}
	}

	.submit {
		display: flex;
		justify-content: space-evenly;
	}
</style>
