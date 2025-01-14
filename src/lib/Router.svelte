<script lang="ts" module>
	const router = new Router();

	export const navigate = router.navigate;
	export const link = router.link;
</script>

<script lang="ts">
	import { Router, page } from './state.svelte';

	import type { Snippet } from 'svelte';
	import type { RouterConfig } from './types';
	import type { InternalRouterConfig } from './internal/types';

	interface RouterProps {
		config: RouterConfig;
		/** This will be rendered when the router has encountered an error. */
		error?: Snippet<[any?]>;
		/** Will be rendered when async components are being loaded. */
		loading?: Snippet;
	}

	let { config, error, loading }: RouterProps = $props();

	router.init(config as InternalRouterConfig);
</script>

{#snippet build()}
	{#if router.CurrentPage}
		{#key router.url}
			{#await router.render(router.CurrentPage)}
				{@render loading?.()}
			{:then data}
				{#if data.layout}
					<data.layout.component {...page}>
						<data.component {...page} />
					</data.layout.component>
				{:else}
					<data.component {...page} />
				{/if}
			{:catch err}
				{@render error?.(err)}
			{/await}
		{/key}
	{:else}
		{@render error?.(404)}
	{/if}
{/snippet}

{#if config.layout}
	<config.layout {...page}>
		{@render build()}
	</config.layout>
{:else}
	{@render build()}
{/if}
