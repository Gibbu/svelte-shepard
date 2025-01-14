import Home from './pages/Home.svelte';
import Layout from './layouts/Layout.svelte';

import type { RouterConfig } from '../lib/types';

const config: RouterConfig = {
	layout: Layout,
	routes: [
		{
			name: 'Home',
			path: '/',
			component: Home
		},
		{
			path: '/test',
			component: () => import('./pages/Test.svelte')
		}
	]
};

export { config };
