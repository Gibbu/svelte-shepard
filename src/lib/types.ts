import type { Component } from 'svelte';

export type ComponentType = Component<any, any> | (() => Promise<{ default: Component<any, any> }>);

export interface Route {
	/** A unique ID for the page. */
	name: string;
	/** The URL path for the component to be rendered. */
	path: string;
	/** The component to be rendered. */
	component: ComponentType;
	/** And default props you wish to pass down on mount. */
	props?: Record<string, any>;
	beforeLoad?: () => Promise<{
		/** Redirect the user to a different route. */
		redirect?: NavigateOptions;
		/**
		 * Props to be passed down to the component before mounting.
		 *
		 * Any duplicate props found in this object will be overwritten by the route `props` option.
		 */
		props?: Record<string, any>;
	}>;
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
