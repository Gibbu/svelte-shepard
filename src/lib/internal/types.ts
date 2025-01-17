import type { Component } from 'svelte';
import type { RouterConfig } from '../types';

export type SyncComponent = Component<any, any>;
export type AsyncComponent = () => Promise<{ default: PageComponent }>;
export type PageComponent = SyncComponent | AsyncComponent;
export type Route = PageRoute | LayoutRoute;

export type OptionalRecord<T extends Record<string, any>, K extends keyof T> = T[K] extends {}
	? T[K]
	: Record<string, any>;
export interface PageType {
	props?: Record<string, any>;
	params?: Record<string, any>;
	query?: Record<string, any>;
}

export type ErrorConfig =
	| number
	| {
			status: number;
			message: string;
	  };

export interface BeforeLoadProps {
	/** Redirect the user to a different route. */
	redirect?: NavigateOptions;
	/**
	 * Props to be passed down to the component before mounting. \
	 * Any duplicate props found in this object will be overwritten by the route `props` option.
	 *
	 * Layout calls will pass also pass down their props to the current page.\
	 * Page changes will retrigger the call.
	 */
	props?: Record<string, any>;
	/** Trigger the router to render the error snippet. */
	error?: ErrorConfig;
}

export type BeforeLoad = (data: Required<PageType>) => Promise<BeforeLoadProps | void>;

export interface BasePageProps {
	/** The component to be rendered. */
	component: PageComponent;
	/** Logic to be run before the component is mounted. */
	beforeLoad?: BeforeLoad;
	/** Props you wish to pass down on mount. */
	props?: Record<string, any>;
	/**  */
	children?: Route[];
}

export interface LayoutRoute extends BasePageProps {
	type: 'layout';
}

export interface PageRoute extends BasePageProps {
	/** The URL path for the component to be rendered. */
	path: string;
	/**
	 * A **unique** ID for the page.
	 *
	 * If no name is provided, a randomly generated ID will be set.
	 */
	name?: string;
	/**
	 * ## Ignore this.
	 *
	 * This is here to make the TypeScript compiler happy with object unions >:L
	 */
	type?: '';
}

/** Used internally. */
export type InternalPage = PageRoute & {
	_layout?: LayoutRoute;
	params?: Record<string, any>;
	query?: Record<string, any>;
};
/** Used internally. */
export type InternalLayout = LayoutRoute & { params?: Record<string, any> };
/** Used internally. */
export type InternalRoute = InternalPage | InternalLayout;
/** Used internally. */
export interface InternalRouterConfig extends RouterConfig {
	routes: InternalRoute[];
	errors: {
		404: string;
	};
}
/** Used internally. */
export interface RouteOptions {
	/** The unique name of the route. */
	name: string;
	/** Any params to be passed to the route. */
	params?: Record<string, any>;
	/** Any queries to be appended to the url. */
	query?: Record<string, any>;
}
/** Used internally. */
export type NavigateOptions = string | RouteOptions;
