<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { enhance } from '$app/forms';
	import type { WWCampaignMembership, PreferenceType } from './types';
	import Preferences from './Preferences.svelte';
	import Gender from './Gender.svelte';
	import type { ActionData } from '../../routes/$types';
	type Props = {
		membership: WWCampaignMembership | null;
		form?: ActionData;
	};

	let { membership, form }: Props = $props();

	let preferences = new SvelteSet<PreferenceType>(['email-marketing', 'sms-marketing']);
	function updatePreference(p: PreferenceType, checked: boolean) {
		checked ? preferences.add(p) : preferences.delete(p);
	}

	let newOrExisting = $state('new member');
</script>

{#if membership}
	<form action="?/checkCustomerExists" method="post" autocomplete="off" use:enhance>
		<fieldset class="member">
			<legend>{newOrExisting}</legend>
			<input type="hidden" name="campaign" value={membership?.campaign} />
			<input type="hidden" name="category" value={membership?.category} />
			<input type="hidden" name="membership" value={membership?.membership} />
			<label>
				<span>first name</span>
				<input type="text" name="firstName" />
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
				<input type="date" name="dob" />
			</fieldset>
			<Gender --inline-size="auto" />
		</section>
		<!-- only show if non-paying -->
		{#if !membership?.paying}
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
		{/if}

		<!-- only show if member is playing sports -->
		{#if membership?.sports}
			<Preferences selected={preferences} update={updatePreference} --inline-size="auto" />
		{/if}

		<!-- only show if member is family -->
		{#if membership?.category === 'family'}
			Family
		{/if}
	</form>
{/if}

{#if !membership}
	<section class="choose">
		<h2>first select a membership to add a new member</h2>
	</section>
{/if}

<style>
	form,
	input {
		outline-color: var(--accent);
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
		h2 {
			max-inline-size: unset;
		}
	}
</style>
