import Docs from '../pages/docs/Index.svelte';
import DocPage from '../pages/docs/Page.svelte';
import DocsLayout from '../layouts/DocsLayout.svelte';
import { findPage, markdown } from '../lib/markdown';

import type { Route } from '../../shepard';

const routes: Route[] = [
	{
		type: 'layout',
		component: DocsLayout,
		children: [
			{
				name: 'Docs',
				path: '/docs',
				component: Docs,
				children: [
					{
						name: 'DocsPage',
						path: '/:id',
						component: DocPage,
						beforeLoad: async ({ params }) => {
							const page = await findPage(
								import.meta.glob('/src/docs/**/*.md', { query: '?raw', import: 'default' }),
								params.id
							);

							if (!page)
								return {
									error: {
										status: 404,
										message: 'Cannot find that page'
									}
								};

							const data = await markdown(page);

							return {
								props: data
							};
						}
					}
				]
			}
		]
	}
];

export default routes;
