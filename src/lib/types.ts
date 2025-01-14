import type { Snippet } from 'svelte';
import type { LayoutRoute, PageRoute, SyncComponent } from './internal/types';

export type Route = PageRoute | LayoutRoute;

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
}

export interface PageData {
	props: Record<string, any>;
	params: Record<string, any>;
	query: Record<string, any>;
}

export interface PageState {
	navigating: boolean;
	page: {
		name: string;
		path: string;
	};
}

export interface Layout extends PageData {
	children: Snippet;
}
