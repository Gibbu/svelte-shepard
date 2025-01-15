import type { Snippet } from 'svelte';
import type { OptionalRecord, PageType, Route, SyncComponent } from './internal/types';

/** The config for the router. */
export interface RouterConfig {
	routes: Route[];
	/** Base layout to be rendered across ALL routes. */
	layout?: SyncComponent;
	/**
	 * String to be prepended on every URL.
	 *
	 * Anchor tags will automatically have the base string prepended on click.
	 */
	base?: string;
	/** Change the default error messages that are used inside the router. */
	errors?: {
		400?: string;
		401?: string;
		403?: string;
		404?: string;
	};
}

/**
 * The structure of the router state.
 *
 *  ```svelte
 * <script>
 * import type { PageState } from 'svelte-shepard';
 *
 * let { props, params, query }: PageState = $props();
 * </script>
 *
 * {params.id}
 * ```
 */
export interface PageState {
	navigating: boolean;
	route: {
		name: string;
		path: string;
	};
}

/**
 *  The structure of the data passed down to the page by the router.
 *
 *  ```svelte
 * <script>
 * import type { Page } from 'svelte-shepard';
 *
 * let { props, params, query }: Page = $props();
 * </script>
 *
 * {params.id}
 * ```
 */
export interface Page<T extends PageType = Required<PageType>> {
	props: OptionalRecord<T, 'props'>;
	params: OptionalRecord<T, 'params'>;
	query: OptionalRecord<T, 'query'>;
}

/**
 *  The structure of the data passed down to the layout by the router.
 *
 *  ```svelte
 * <script>
 * import type { Layout } from 'svelte-shepard';
 *
 * let { children, props, params, query }: Layout = $props();
 * </script>
 *
 * {params.id}
 *
 * {@render children()}
 * ```
 */
export interface Layout<T extends PageType = Required<PageType>> extends Page<T> {
	children: Snippet;
}
