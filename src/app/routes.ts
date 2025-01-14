import Home from './pages/Home.svelte';
import About from './pages/About.svelte';
import User from './pages/user/Index.svelte';
import UserEdit from './pages/user/Edit.svelte';
import AboutChild from './pages/AboutChild.svelte';
import AboutLayout from './layouts/AboutLayout.svelte';
import TestLayout from './layouts/TestLayout.svelte';

import type { RouterConfig } from '../lib/types';
import Layout from './layouts/Layout.svelte';

const config: RouterConfig = {
	layout: Layout,
	routes: [
		{
			name: 'Home',
			path: '/',
			component: Home
		},
		{
			type: 'layout',
			component: AboutLayout,
			children: [
				{
					name: 'About',
					path: 'about',
					component: About,
					props: {
						newProp: 'testing123'
					},
					children: [
						{
							name: 'AboutChild',
							path: 'child',
							component: AboutChild
						}
					]
				}
			]
		},
		{
			type: 'layout',
			component: TestLayout,
			children: [
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
		}
	]
};

export { config };
