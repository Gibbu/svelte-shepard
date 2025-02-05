<script lang="ts" module>
	import { Router, page } from './state.svelte';

	const router = new Router();

	/**
	 * Programmatically load a new route.
	 * @param opts The string or object to navigate to.
	 */
	export const navigate = router.navigate;

	/**
	 * A helper function to map route named keys to the route path.
	 * @param name The unique name of the route.
	 * @param opts Any optional params or queries you wish to pass.
	 */
	export const mapRoute = router.mapRoute;

	/**
	 * The svelte action to navigate to other routes.
	 *
	 * If the action is used on an `a` tag it will use the\
	 * `href` attribute first, then the `opts` argument.
	 */
	export const link = router.link;
</script>

<script lang="ts">
	import Layout from './internal/Layout.svelte';

	import type { Snippet } from 'svelte';
	import type { RouterConfig } from './types';
	import type { ErrorObject } from './internal/types';

	interface RouterProps {
		config: RouterConfig;
		error?: Snippet<[ErrorObject | null]>;
		loading?: Snippet;
	}

	let { config, error, loading }: RouterProps = $props();

	router.initialize(config);

	const GlobalLayout = config.layout || Layout;
</script>

<GlobalLayout>
	{#await router.render()}
		{@render loading?.()}
	{:then data}
		{#if router.error.status === 0}
			{@const PageLayout = data.layout?.component || Layout}
			<PageLayout {...page}>
				<data.component {...page} />
			</PageLayout>
		{:else}
			{@render error?.(router.error)}
		{/if}
	{:catch err}
		{@render error?.(err)}
	{/await}
</GlobalLayout>
