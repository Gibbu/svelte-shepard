<script lang="ts">
	import { Router } from './lib';

	import Home from './pages/Home.svelte';
	import Settings from './pages/settings/Index.svelte';
	import SettingsAccount from './pages/settings/account/Index.svelte';
	import SettingsAvatar from './pages/settings/account/Avatar.svelte';
	import SettingsPreferences from './pages/settings/Preferences.svelte';
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
				name: 'Settings',
				path: '/settings',
				component: Settings,
				children: [
					{
						name: 'SettingsAccount',
						path: '/account',
						component: SettingsAccount,
						children: [
							{
								name: 'SettingsPassword',
								path: '/password',
								component: () => import('./pages/settings/account/Password.svelte'),
								children: [
									{
										name: 'test',
										path: '/home',
										component: Home
									},
								]
							},
							{
								name: 'SettingsAvatar',
								path: '/avatar',
								component: SettingsAvatar
							}
						]
					},
					{
						name: 'SettingsPreferences',
						path: '/preferences',
						component: SettingsPreferences
					}
				]
			}
		]
	}}
>
	{#snippet layout()}
		<nav>
			<a href="/">Home</a>
			<a href="/settings">Settings</a>
		</nav>
	{/snippet}
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		{err}
		Error?
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
