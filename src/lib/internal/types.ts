import type { Component } from 'svelte';
import type { Route, RouterConfig } from '../types';

export type SyncComponent = Component<any, any>;
export type AsyncComponent = () => Promise<{ default: PageComponent }>;

export type PageComponent = SyncComponent | AsyncComponent;

export interface BeforeLoadProps {
	/** Redirect the user to a different route. */
	redirect?: NavigateOptions;
	/**
	 * Props to be passed down to the component before mounting. \
	 * Any duplicate props found in this object will be overwritten by the route `props` option.
	 *
	 * Layout calls will pass also pass down their props to the current page.\
	 * And page changes will retrugger the call.
	 */
	props?: Record<string, any>;
}

export type BeforeLoad = () => Promise<BeforeLoadProps | void>;

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
	/** A **unique** ID for the page. */
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
