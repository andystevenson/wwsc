<form method="get" action="/login/google">
	<div>
		<h1>Welcome</h1>
		<button><i class="bi bi-box-arrow-in-right"></i>login</button>
	</div>
</form>

<style>
	form {
		block-size: 100%;
		display: grid;
		background-image: url('/login.avif');
		background-size: cover;
		background-position: center;

		h1 {
			opacity: 0.7;
		}
		.bi {
			font-size: var(--font-size-4);
			padding-right: var(--size-2);
		}
		button {
			color: var(--text-1);
			font-size: var(--font-size-4);
			opacity: 0.5;
		}

		div {
			margin: 0 auto;
			margin-block-start: 1vh;
			block-size: fit-content;
			display: grid;
			gap: var(--size-2);
			place-items: center;
		}
	}
</style>
