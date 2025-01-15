import { sanitizeUrl } from '@braintree/sanitize-url';
import { createUID, deepClone, log } from './internal/utils';
import { RouterError, convertErrorConfig } from './internal/error';
import queryString from 'query-string';

import type {
	AsyncComponent,
	BeforeLoadProps,
	ErrorConfig,
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
	route: {
		name: '',
		path: ''
	}
});

export class Router {
	url = $state<string>('/');
	base: InternalRouterConfig['base'] = '';
	routes: InternalRouterConfig['routes'] = [];
	errors: InternalRouterConfig['errors'] = {
		'400': 'Bad request',
		'401': 'Unauthorized',
		'403': 'Forbidden',
		'404': 'Not found'
	};
	error = $state<{ status: number; message?: string } | null>(null);

	internalRoutes: InternalPage[] = [];

	//
	// Private methdods (not exported)
	//
	init = (config: InternalRouterConfig) => {
		this.base = config.base;
		this.routes = config.routes;
		this.errors = { ...this.errors, ...config.errors };

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
	getRoute = () => {
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
		if (!route) return undefined;

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
	};
	runBefore = async (route?: InternalRoute) => {
		let props: BeforeLoadProps = route?.props || {};
		if (!route) return props;
		const before = await route.beforeLoad?.({
			params: route.params || {},
			props: route.props || {},
			query: !route.type ? route.query || {} : {}
		});
		if (typeof before === 'object') {
			if (before.error) {
				const { status, message } = convertErrorConfig(before.error);
			}
			if (before.redirect) this.navigate(before.redirect);
			if (before.props) props = { ...props, ...before.props };
		}
		return props;
	};
	render = async (route?: InternalPage) => {
		if (!route) return new RouterError({ status: 404, message: this.errors['404'] });
		if (this.error) throw new RouterError(this.error);

		let component: PageComponent | null = null;

		try {
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
			state.route = {
				name: route.name || '',
				path: route.path
			};

			return {
				layout: route._layout,
				component,
				children: route.children
			};
		} catch (err) {
			throw new RouterError(err as RouterError);
		}
	};

	//
	// State functions
	//
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
		if (!route) return log.error(`Cannot find a route by the unique name of: "${opts.name}"`);

		let path = route.path;

		if (path.includes(':')) {
			const routeParams = path
				.split('/')
				.filter((el) => el.startsWith(':'))
				.map((el) => el.replace(':', ''));
			if (!opts.params && routeParams.length)
				log.error('This route requires params to be passed.', `Params to be passed: ${routeParams.join(',')}`);

			const optsParams = Object.keys(opts.params!);
			const missingParams = optsParams.filter((el) => !routeParams.includes(el));
			if (missingParams.length) return log.error(`Route requires these params: ${missingParams.join(',')}`);
			if (optsParams.length !== routeParams.length)
				return log.error(
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

	/**
	 * Programmatically load a new route.
	 * @param opts The string or object to navigate to.
	 */
	navigate = (opts: NavigateOptions) => {
		if (typeof opts !== 'string') {
			this.#push(this.#parseURLParams(opts));
		} else {
			this.#push(opts);
		}
	};
	/**
	 * A helper function to map route named keys to the route path.
	 * @param name The unique name of the route.
	 * @param opts Any optional params or queries you wish to pass.
	 */
	link = (name: string, opts?: Omit<RouteOptions, 'name'>) => {
		return this.#parseURLParams({ name, ...opts });
	};
}
