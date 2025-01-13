import type { Snippet } from 'svelte';
import type { LayoutRoute, PageRoute } from './internal/types';

export type Route = PageRoute | LayoutRoute;

export interface RouterConfig {
	routes: Route[];
	base?: string;
}

export interface Page {
	props: Record<string, any>;
	params: Record<string, any>;
	query: Record<string, any>;
}

export interface Layout extends Page {
	children: Snippet;
}
