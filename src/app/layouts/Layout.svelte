<script lang="ts">
	import { navigate, page, link, type Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<nav>
	<a href={link({ name: 'Home' })}>Home</a>
	<a href={link({ name: 'About', query: { testing: 123 } })}>About</a>
	<a href={link({ name: 'User', params: { id: 444 } })}>User 444</a>
	<a href={link({ name: 'User', params: { id: 333 } })} data-shepard-disabled>Disabled click</a>
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
		background: var(--background-darker);
		padding: 10px;
		margin: 10px;
		border-radius: 5px;
	}
</style>
