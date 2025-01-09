<script lang="ts">
	import { Router } from './lib';

	import Home from './pages/Home.svelte';
	import About from './pages/About.svelte';
	import User from './pages/user/Index.svelte';
	import UserEdit from './pages/user/Edit.svelte';
</script>

<Router
	config={{
		routes: [
			{
				name: 'Home',
				path: '/',
				component: Home
			},
			{
				name: 'About',
				path: '/about',
				component: About
			},
			{
				name: 'User',
				path: '/user/:id',
				component: User,
				children: [
					{
						name: 'UserEdit',
						path: '/edit',
						component: UserEdit
					}
				]
			}
		]
	}}
>
	{#snippet layout()}
		<nav>
			<a href="/">Home</a>
			<a href="/about">About</a>
		</nav>
	{/snippet}
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
