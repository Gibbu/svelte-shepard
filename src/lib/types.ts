import type { Component } from 'svelte';

export interface Route {
	/** A unique ID for the page. */
	name: string;
	/** The URL path for the component to be rendered. */
	path: string;
	/** The component to be rendered. */
	component: () => Promise<{ default: Component }>;
	/** And default props you wish to pass down on mount. */
	props?: Record<string, any>;
	beforeLoad?: () => Promise<
		| boolean
		| {
				/** The **unique ID** of the page. */
				redirect?: string;
				/**
				 * Props to be passed down to the component before mounting.
				 *
				 * Any duplicate props found in this object will be overwritten by the `props` option.
				 */
				props?: Record<string, any>;
		  }
	>;
	children?: Route[];
}

export interface RouterConfig {
	routes: Route[];
	baseURL?: string;
}

interface NavigateWithName {
	name: string;
	params?: Record<string, any>;
}
interface NavigateWithUrl {
	url: string;
}
export type NavigateOptions = NavigateWithName | NavigateWithUrl;
