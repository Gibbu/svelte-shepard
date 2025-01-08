<script lang="ts" module>
</script>

<script lang="ts">
	import { Router } from './state.svelte';

	import type { Snippet } from 'svelte';
	import type { Route, RouterConfig } from './types';

	let {
		config,
		layout,
		error,
		loading
	}: { config: RouterConfig; layout?: Snippet; error?: Snippet<[any?]>; loading?: Snippet } = $props();

	const router = new Router(config);

	const loadComponent = async () => {
		if (router.CurrentPage) {
			let beforeProps: Record<string, any> = {};
			const before = await router.CurrentPage.beforeLoad?.();
			if (before) {
				if (typeof before === 'boolean' && !before) throw new Error('beforeLoad hook was returned false.');
				if (typeof before === 'object') {
					if (before.props) beforeProps = before.props;
					// if (before.redirect) router.
				}
			}

			const component = (await router.CurrentPage.component()).default;

			return {
				component,
				props: {
					...router.CurrentPage.props
					// ...,
				}
			};
		}
	};
</script>

{#snippet build(route: Route | null)}
	{#if route}
		{#await route.component()}
			{@render loading?.()}
		{:then { default: Component }}
			<Component />
		{:catch err}
			{@render error?.(err)}
		{/await}
	{:else}
		{@render error?.()}
	{/if}
{/snippet}

{@render layout?.()}

{@render build(router.CurrentPage)}
