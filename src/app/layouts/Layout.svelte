<script lang="ts">
	import { navigate, page, type Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about?testing=123">About</a>
	<a href="/user/444">User 444</a>
	<a href="/user/123/edit" data-shepard-disabled>Disabled click</a>
	<button
		type="button"
		onclick={() => {
			navigate({
				name: 'User',
				params: {
					id: '3123'
				},
				query: {
					search: 'testingthestuffs',
					does: 'this work?'
				}
			});
		}}>Goto user</button
	>
</nav>

<pre>{JSON.stringify(page.props, null, 2)}</pre>
<pre>{JSON.stringify(page.params, null, 2)}</pre>
<pre>{JSON.stringify(page.query, null, 2)}</pre>

<main>
	{@render children?.()}
</main>

<style>
	nav {
		background: light-dark(var(--colour-moon-mist-darker), var(--colour-dune-darker));
		padding: 10px;
		margin: 10px;
		border-radius: 5px;
	}
</style>
