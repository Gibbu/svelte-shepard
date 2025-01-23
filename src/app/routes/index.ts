import Home from '../pages/Home.svelte';
import Layout from '../layouts/Layout.svelte';
import docs from './docs';

import type { RouterConfig } from '../../shepard';

const config: RouterConfig = {
	layout: Layout,
	routes: [
		{
			name: 'Home',
			path: '/',
			component: Home
		},
		...docs
	],
	errors: {
		'404': 'I cannot find that page... :('
	}
};

export { config };
