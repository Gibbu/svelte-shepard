<script lang="ts" module>
	const router = new Router();

	export const navigate = router.navigate;
</script>

<script lang="ts">
	import { Router } from './state.svelte';

	import type { Snippet } from 'svelte';
	import type { RouterConfig } from './types';
	import type {
		InternalPage,
		InternalRoute,
		InternalRouterConfig,
		PageComponent,
		BeforeLoadProps,
		AsyncComponent
	} from './internal/types';

	interface RouterProps {
		config: RouterConfig;
		/** This will be rendered when the router has encountered an error. */
		error?: Snippet<[any?]>;
		/** Will be rendered when async components are being loaded. */
		loading?: Snippet;
	}

	let { config, error, loading }: RouterProps = $props();

	router.init(config as InternalRouterConfig);

	const runBefore = async (route?: InternalRoute) => {
		let props: BeforeLoadProps = route?.props || {};
		if (!route) return props;
		const run = await route.beforeLoad?.();
		if (typeof run === 'object') {
			if (run.redirect) router.navigate(run.redirect);
			if (run.props) props = { ...props, ...run.props };
		}
		return props;
	};

	const loadComponent = async (route: InternalPage) => {
		let component: PageComponent | null = null;
		if (route.component.name === 'component') {
			const tmp = route.component as AsyncComponent;
			component = (await tmp()).default;
		} else {
			component = route.component;
		}

		let props: Record<string, any> = {
			...(await runBefore(route._layout)),
			...(await runBefore(route))
		};

		return {
			layout: route._layout,
			component,
			children: route.children,
			props,
			params: route.params
		};
	};
</script>

{#snippet build(route: InternalPage)}
	{#await loadComponent(route)}
		{@render loading?.()}
	{:then data}
		{#if data.layout}
			<data.layout.component props={data.props} params={data.params}>
				{#key router.url}
					<data.component props={data.props} params={data.params} />
				{/key}
			</data.layout.component>
		{:else}
			{#key router.url}
				<data.component props={data.props} params={data.params} />
			{/key}
		{/if}
	{:catch err}
		{@render error?.(err)}
	{/await}
{/snippet}

{#if router.CurrentPage}
	{@render build(router.CurrentPage)}
{:else}
	{@render error?.(404)}
{/if}
