<script lang="ts" module>
</script>

<script lang="ts">
	import { Router } from './state.svelte';

	import type { Component, Snippet } from 'svelte';
	import type { Route, RouterConfig, ComponentType } from './types';

	let {
		config,
		layout,
		error,
		loading
	}: { config: RouterConfig; layout?: Snippet; error?: Snippet<[any?]>; loading?: Snippet } = $props();

	const router = new Router(config);

	const loadComponent = async (route: Route) => {
		let beforeProps: Record<string, any> = {};
		const before = await route.beforeLoad?.();
		if (before) {
			if (before.redirect) {
				router.navigate(before.redirect);
				return {};
			}
			if (before.props) beforeProps = before.props;
		}

		let component: ComponentType | null = null;
		if (route.component.name === 'component') {
			const test = route.component as unknown as () => Promise<{ default: Component<any, any> }>;
			component = (await test()).default;
		} else {
			component = route.component;
		}

		return {
			component,
			children: route.children,
			props: {
				...beforeProps,
				...route.props
			}
		};
	};
</script>

{@render layout?.()}

{#if router.CurrentPage}
	{@render build(router.CurrentPage)}
{/if}

{#snippet build(route: Route)}
	{#snippet getComponent(route: Route)}
		{#await loadComponent(route)}
			{@render loading?.()}
		{:then data}
			{#if data.children}
				<data.component {...data.props} />
				{@const child = data.children.find((el) => router.url.toString().includes(el.path))}
				{#if child}
					{@render getComponent(child)}
				{/if}
			{:else}
				<data.component {...data.props} />
			{/if}
		{:catch err}
			{@render error?.(err)}
		{/await}
	{/snippet}

	{@render getComponent(route)}
{/snippet}
