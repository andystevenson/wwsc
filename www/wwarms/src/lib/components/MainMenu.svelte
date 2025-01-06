<script lang="ts">
	import { page } from '$app/stores';

	// the nav starts our wanting to be collapsed
	let collapse = $state(true);
	let icon = $derived(collapse ? 'bi-arrows-collapse-vertical' : 'bi-arrows-expand-vertical');
	let showPopover = $state(false);
	$effect(() => {
		let popover = document.getElementById('expand');
		if (!popover) return;
		showPopover ? popover.showPopover() : popover.hidePopover();
	});

	function active(pathname: string) {
		return $page.url.pathname === `/${pathname}`;
	}
</script>

<nav>
	<a class="icon" href="/"><img src="/favicon.svg" alt="west warwicks icon of a bear" /></a>
	<ul>
		<li class:active={active('dashboard')}>
			<a href="/dashboard"><i class="bi bi-speedometer2"></i><span>dashboard</span></a>
		</li>
		<li class:active={active('members')}>
			<a href="/members"><i class="bi bi-people"></i><span>members</span></a>
		</li>
		<li class:active={active('subscriptions')}>
			<a href="/subscriptions"><i class="bi bi-person-badge"></i><span>subscriptions</span></a>
		</li>
		<li class:active={active('categories')}>
			<a href="/categories"><i class="bi bi-palette"></i><span>categories</span></a>
		</li>
		<li class:active={active('campaigns')}>
			<a href="/campaigns"><i class="bi bi-megaphone"></i><span>campaigns</span></a>
		</li>
		<li class:active={active('payments')}>
			<a href="/payments"><i class="bi bi-currency-pound"></i><span>payments</span></a>
		</li>
		<li class:active={active('reports')}>
			<a href="/reports"><i class="bi bi-book"></i><span>reports</span></a>
		</li>
		<li class:active={active('settings')}>
			<a href="/settings"><i class="bi bi-gear"></i><span>settings</span></a>
		</li>
		<li class:active={active('logout')}>
			<a href="/logout"><i class="bi bi-box-arrow-in-right"></i><span>logout</span></a>
		</li>
	</ul>
	<button
		popovertarget="expand"
		class:collapse
		class:expand={!collapse}
		class="expander button-icon"
		onclick={() => (collapse = !collapse)}
		onmouseenter={() => (showPopover = true)}
		onmouseleave={() => (showPopover = false)}
	>
		<i class="bi {icon}"></i>
		<span hidden>expander</span>
	</button>
	<p popover="manual" id="expand">{collapse ? 'collapse' : 'expand'}</p>
</nav>

<style>
	nav {
		--_feint: hsl(var(--gray-3-hsl) / 0.3);
		position: relative;
		padding-inline: var(--size-4);
		padding-block: var(--size-4);
		grid-template-rows: min-content 1fr;
		display: grid;
		margin-inline-end: var(--size-3);
		border-inline-end: 1px solid var(--_feint);

		&:has(.collapse):has(:popover-open) {
			padding-inline-end: calc(var(--size-4) - var(--size-1));
			margin-inline-end: calc(var(--size-3) + var(--size-1));
		}

		&:has(.expand):has(:popover-open) {
			padding-inline-end: calc(var(--size-4) + var(--size-1));
			margin-inline-end: calc(var(--size-3) - var(--size-1));
		}
		&:has(.expand) {
			li span {
				display: none;
			}
		}
	}

	ul {
		display: grid;
		place-content: center;
		gap: var(--size-4);
	}

	li {
		display: grid;
		gap: var(--size-1);
		inline-size: 100%;
		padding-inline: var(--size-3);

		&.active {
			font-weight: bolder;
			color: var(--accent);
			text-decoration: underline;
			text-underline-offset: 0.2em;
			i {
				color: var(--accent);
			}
		}

		&:hover {
			background-color: var(--gray-8);
			border-radius: var(--radius-2);
		}
	}

	a {
		text-decoration: none;
		color: var(--text-1);
		display: flex;
		align-items: center;
		gap: var(--size-3);
		font-size: var(--font-size-4);
	}

	i {
		font-size: var(--font-size-5);
	}

	img {
		min-inline-size: var(--size-8);
		max-block-size: var(--size-11);
		margin: auto;
	}

	.expander {
		--_icon-size: var(--font-size-3);
		--_fiddle-factor: 1rem / 16;
		--_right: calc((var(--size-1) * 2 + var(--_icon-size) + var(--_fiddle-factor)) / 2 * -1);
		position: absolute;
		bottom: 50%;
		right: var(--_right);
		display: grid;

		span {
			display: none;
		}

		i {
			font-size: var(--_icon-size);
			color: var(--_feint);
			&:hover {
				color: var(--text-1);
				scale: 1.1;
			}
		}
		anchor-name: --expander;
	}

	.button-icon {
		--_bg: unset;
		--_border: unset;
		box-shadow: unset;
		padding: var(--size-1);
	}

	[popover] {
		transition:
			display 2s,
			opacity 2s;
		transition-behavior: allow-discrete;
		position: absolute;
		inset: auto;
		top: anchor(top);
		left: anchor(right);
		position-anchor: --expander;

		&:popover-open {
			background-color: var(--surface-2);
			padding-inline: var(--size-3);
			border-radius: var(--radius-2);
			box-shadow: var(--shadow-1);
			opacity: 1;
			@starting-style {
				opacity: 0;
			}
		}
	}
</style>
