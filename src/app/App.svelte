<script lang="ts">
	import { Router, navigate } from '../lib';

	import { config } from './routes';
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/user/123">User 123</a>
	<a href="/user/444">User 444</a>
	<a href="/user/123/edit" data-shepard-disabled>Edit User 123</a>
	<button
		type="button"
		onclick={() => {
			navigate({
				name: 'User',
				params: {
					id: '3123'
				}
			});
		}}>Goto user</button
	>
</nav>

<Router {config}>
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		SOME SORT OF ERROR?
		<pre>
			{err}
		</pre>
	{/snippet}
</Router>

<style>
	nav {
		background: light-dark(var(--colour-moon-mist-darker), var(--colour-dune-darker));
		padding: 10px;
		margin: 10px;
		border-radius: 5px;
	}
</style>
