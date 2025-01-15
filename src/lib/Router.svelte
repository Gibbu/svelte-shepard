<script lang="ts" module>
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
	import { Router, page } from './state.svelte';
	import { RouterError } from './internal/error';

	import type { Snippet } from 'svelte';
	import type { RouterConfig } from './types';
	import type { InternalRouterConfig } from './internal/types';

	interface RouterProps {
		config: RouterConfig;
		/** This will be rendered when the router has encountered an error. */
		error?: Snippet<[RouterError]>;
		/** Will be rendered when async components are being loaded. */
		loading?: Snippet;
	}

	let { config, error, loading }: RouterProps = $props();

	router.init(config as InternalRouterConfig);
</script>

{#snippet build()}
	{#key router.url}
		{#await router.render(router.getRoute())}
			{@render loading?.()}
		{:then data}
			{#if !(data instanceof RouterError)}
				{#if data.layout}
					<data.layout.component {...page}>
						<data.component {...page} />
					</data.layout.component>
				{:else}
					<data.component {...page} />
				{/if}
			{:else}
				{@render error?.(router.error)}
			{/if}
		{:catch err}
			{@render error?.(router.error)}
		{/await}
	{/key}
{/snippet}

{#if config.layout}
	<config.layout {...page}>
		{@render build()}
	</config.layout>
{:else}
	{@render build()}
{/if}
