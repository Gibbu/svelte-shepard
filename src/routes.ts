import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/user/Index.svelte';
import UserEdit from './pages/user/Edit.svelte';
import AboutChild from './pages/AboutChild.svelte';
import AboutLayout from './layouts/AboutLayout.svelte';
import TestLayout from './layouts/TestLayout.svelte';

import type { RouterConfig } from './lib/types';

const config: RouterConfig = {
	routes: [
		{
			path: '/',
			component: Home
		},
		{
			type: 'layout',
			component: AboutLayout,
			children: [
				{
					path: 'about',
					component: About,
					children: [
						{
							path: 'child',
							component: AboutChild
						}
					]
				}
			]
		},
		{
			name: 'User',
			path: '/user/:id',
			component: User,
			children: [
				{
					path: '/edit',
					component: UserEdit
				}
			]
		}
	]
};

export { config };
