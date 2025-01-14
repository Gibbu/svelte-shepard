import { sanitizeUrl } from '@braintree/sanitize-url';
import { createUID, deepClone, error } from './internal/utils';
import queryString from 'query-string';

import type {
	AsyncComponent,
	BeforeLoadProps,
	InternalPage,
	InternalRoute,
	InternalRouterConfig,
	LayoutRoute,
	NavigateOptions,
	PageComponent,
	RouteOptions
} from './internal/types';
import type { Page, PageState } from './types';

/** The data of the page. */
export let page = $state<Page>({
	params: {},
	props: {},
	query: {}
});

/** General state of the router. */
export let state = $state<PageState>({
	navigating: false,
	page: {
		name: '',
		path: ''
	}
});

export class Router {
	url = $state<string>('/');
	base: InternalRouterConfig['base'] = '';
	routes: InternalRouterConfig['routes'] = [];

	internalRoutes: InternalPage[] = [];

	CurrentPage = $derived.by(() => {
		const { url, query } = queryString.parseUrl(this.url);
		const parsedURL = url.startsWith('http') ? new URL(this.url).pathname : url;
		const urlParts = parsedURL.split('/');

		// 1-1 match, no params found.
		const plain = this.internalRoutes.find((el) => el.path === parsedURL);
		if (plain) {
			if (query) plain.query = query;
			return plain;
		}

		// No 1-1 match, params must be present.
		const candidateRoutes = this.internalRoutes.filter((el) => {
			let path = el.path;
			if (this.base) {
				path = path.replace(this.base + '/', '');
			}

			return path.startsWith('/' + urlParts[this.base ? 2 : 1]);
		});
		const route = candidateRoutes.find((el) => el.path.split('/').length === urlParts.length);
		if (!route) return null;

		// Find param positions.
		let paramLoc: number[] = [];
		const pathSplit = route.path.split('/');

		for (let i = 0; i < pathSplit.length; i++) {
			const part = pathSplit[i];
			if (part.startsWith(':')) paramLoc.push(route.path.split('/').indexOf(part));
		}

		// Replace params with values from URL
		for (let i = 0; i < paramLoc.length; i++) {
			const param = paramLoc[i];
			const key = route.path.split('/')[param].replace(':', '');
			const value = urlParts[param];

			if (!route.params) route.params = {};
			route.params[key] = value;
		}

		if (query) route.query = query;

		return route;
	});

	//
	// Private methdods (not exported)
	//
	init = (config: InternalRouterConfig) => {
		this.base = config.base;
		this.routes = config.routes;

		this.#parseRoutes();

		this.url = sanitizeUrl(window.location.href);

		window.history.pushState = new Proxy(window.history.pushState, {
			apply: (target, thisArg, args) => {
				this.url = sanitizeUrl(args[2]);

				return target.apply(thisArg, args as any);
			}
		});

		window.addEventListener('popstate', this.#handlePopstate);
		window.addEventListener('click', this.#handleClick);
	};
	runBefore = async (route?: InternalRoute) => {
		let props: BeforeLoadProps = route?.props || {};
		if (!route) return props;
		const run = await route.beforeLoad?.(route.params || {});
		if (typeof run === 'object') {
			if (run.redirect) this.navigate(run.redirect);
			if (run.props) props = { ...props, ...run.props };
		}
		return props;
	};
	render = async (route: InternalPage) => {
		let component: PageComponent | null = null;
		if (route.component.name === 'component') {
			const tmp = route.component as AsyncComponent;
			component = (await tmp()).default;
		} else {
			component = route.component;
		}

		let props: Record<string, any> = {
			...(await this.runBefore(route._layout)),
			...(await this.runBefore(route))
		};

		page.props = props;
		page.params = route.params || {};
		page.query = route.query || {};

		state.navigating = false;
		state.page = {
			name: route.name || '',
			path: route.path
		};

		return {
			layout: route._layout,
			component,
			children: route.children
		};
	};

	#parseRoutes = () => {
		const paths = new Map();
		const clonedRoutes = deepClone(this.routes);

		const mapRoutes = (routes: InternalRoute[], component?: LayoutRoute, path?: string) => {
			for (let i = 0; i < routes.length; i++) {
				const el = routes[i];
				let lastLayout: LayoutRoute | undefined = component;

				if (!el.type) {
					if (!el.name) el.name = createUID();
					if (lastLayout) el._layout = lastLayout;
					if (!el.path.startsWith('/')) el.path = '/' + el.path;

					if (path) el.path = path + el.path;
				}

				if (el.children) {
					if (el.type === 'layout') lastLayout = el;

					if (!el.type) mapRoutes(el.children, lastLayout, el.path);
					mapRoutes(el.children, lastLayout);
				}
				if (!el.type && !paths.has(el.name)) paths.set(el.name, el);
			}
		};

		mapRoutes(clonedRoutes);

		this.internalRoutes = Array.from(paths).map(([_, v]: InternalPage[]) => {
			if (this.base) v.path = `/${this.base}${v.path}`;
			return v;
		});
	};
	#push = (url: string) => {
		state.navigating = true;
		history.pushState(null, '', sanitizeUrl(url));
	};
	#handlePopstate = () => {
		this.url = sanitizeUrl(window.location.pathname);
	};
	#handleClick = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.nodeName === 'A' || target.nodeName === 'A') {
			const disabled = target.getAttribute('data-shepard-disabled');
			if (disabled === '') return;

			const anchor = target as HTMLAnchorElement;
			const href = anchor.getAttribute('href');
			if (href?.startsWith('/')) {
				e.preventDefault();
				if (href !== this.url) {
					if (this.base) this.#push(`/${this.base}${href}`);
					else this.#push(href);
				}
			}
		}
	};
	#parseURLParams = (opts: RouteOptions) => {
		const route = this.internalRoutes.find((el) => el.name === opts.name);
		if (!route) return error(`Cannot find a route by the unique name of: "${opts.name}"`);

		let path = route.path;

		if (path.includes(':')) {
			const routeParams = path
				.split('/')
				.filter((el) => el.startsWith(':'))
				.map((el) => el.replace(':', ''));
			if (!opts.params && routeParams.length)
				return error('This route requires params to be passed.', `Params to be passed: ${routeParams.join(',')}`);

			const optsParams = Object.keys(opts.params!);
			const missingParams = optsParams.filter((el) => !routeParams.includes(el));
			if (missingParams.length) return error(`Route requires these params: ${missingParams.join(',')}`);
			if (optsParams.length !== routeParams.length)
				return error(
					'Incorrect amount of params passed to route',
					`Expecting: ${routeParams.join(',')}`,
					`Passed: ${optsParams.join(',')}`
				);
			path = path
				.split('/')
				.map((el) => {
					if (el.startsWith(':')) {
						const key = el.replace(':', '');
						return opts.params![key];
					}
					return el;
				})
				.join('/');
		}

		if (opts.query) path += '?' + queryString.stringify(opts.query);

		return path;
	};

	//
	// Public methods (exported)
	//
	navigate = (opts: NavigateOptions) => {
		if (typeof opts !== 'string') {
			this.#push(this.#parseURLParams(opts));
		} else {
			this.#push(opts);
		}
	};
	/**
	 * A helper function to map route named keys to the route path.
	 * @param opts The options of the route.
	 * @param notFound The URL to be returned if the route does not exist.
	 */
	link = (opts: RouteOptions, notFound: string = 'not-found') => {
		const route = this.internalRoutes.find((el) => el.name === opts.name);
		if (!route) return notFound;

		return this.#parseURLParams(opts);
	};
}
