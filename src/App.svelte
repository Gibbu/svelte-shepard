<script lang="ts">
	import { Router } from './lib';
</script>

<Router
	config={{
		routes: [
			{
				name: 'Home',
				path: '/',
				component: () => import('./pages/Home.svelte')
			},
			{
				name: 'Page',
				path: '/page',
				component: () => import('./pages/Page.svelte'),
				children: [
					{
						name: 'PageTest',
						path: '/test',
						component: () => import('./pages/PageTest.svelte')
					}
				]
			}
		]
	}}
>
	{#snippet layout()}
		<nav>
			<a href="/">Home</a>
			<a href="/page">Page</a>
		</nav>
	{/snippet}
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		Error?
	{/snippet}
</Router>
