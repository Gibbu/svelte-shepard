import Home from './pages/Home.svelte';
import Layout from './layouts/Layout.svelte';
import Docs from './pages/docs/Index.svelte';
import DocPage from './pages/docs/Page.svelte';

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
			name: 'Docs',
			path: '/docs',
			component: Docs,
			children: [
				{
					name: 'DocsPage',
					path: '/:id',
					component: DocPage,
					async beforeLoad() {
						console.log('test');
					}
				}
			]
		}
	],
	errors: {
		'404': 'I cannot find that page... :('
	}
};

export { config };
