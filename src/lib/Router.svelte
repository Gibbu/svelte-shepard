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
	export const link = router.link;
</script>

<script lang="ts">
	import Layout from './internal/Layout.svelte';
	import { RouterError } from './internal/error';

	import type { Snippet } from 'svelte';
	import type { RouterConfig } from './types';
	import type { ErrorConfig } from './internal/types';

	interface RouterProps {
		config: RouterConfig;
		error?: Snippet<[ErrorConfig | null]>;
		loading?: Snippet;
	}

	let { config, error, loading }: RouterProps = $props();

	router.initialize(config);

	const GlobalLayout = config.layout || Layout;
</script>

<GlobalLayout>
	{#key router.URL}
		{#await router.render()}
			{@render loading?.()}
		{:then data}
			{#if !(data instanceof RouterError)}
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
	{/key}
</GlobalLayout>
