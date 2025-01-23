import { sanitizeUrl } from '@braintree/sanitize-url';
import { createUID, deepClone, log } from './internal/utils.js';

import type { Page, RouterConfig, RouterData } from './types.ts';
import type {
	AsyncComponent,
	BeforeLoadProps,
	ErrorObject,
	InternalPage,
	InternalRoute,
	InternalRouterConfig,
	LayoutRoute,
	NavigateOptions,
	PageComponent,
	RouteOptions
} from './internal/types.js';
import queryString from 'query-string';
import { convertErrorConfig, RouterError } from './internal/error.js';

/** The data related to the page. */
export let page = $state<Page>({
	params: {},
	props: {},
	query: {}
});

/** Overall state of the router. */
export let state = $state<RouterData>({
	navigating: false,
	route: {
		name: '',
		path: ''
	},
	url: new URL(window.location.href)
});

export class Router {
	URL = $state<string>('/');
	error: ErrorObject = { status: 0, message: '' };

	#base: InternalRouterConfig['base'];
	#errors: InternalRouterConfig['errors'] = {
		'404': 'Bad Request'
	};
	#routes: InternalPage[] = [];

	#applyHandlers = () => {
		const handlePopstate = () => {
			this.URL = sanitizeUrl(window.location.pathname);
		};
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.nodeName === 'A' || target.nodeName === 'A') {
				const disabled = target.getAttribute('data-shepard-disabled');
				if (disabled === '') return;

				const anchor = target as HTMLAnchorElement;
				const href = anchor.getAttribute('href');
				if (href?.startsWith('/')) {
					e.preventDefault();
					if (href !== this.URL) {
						if (this.#base) this.#push(`/${this.#base}${href}`);
						else this.#push(href);
					}
				}
			}
		};

		$effect(() => {
			window.history.pushState = new Proxy(window.history.pushState, {
				apply: (target, thisArg, args) => {
					this.URL = sanitizeUrl(args[2]);

					return target.apply(thisArg, args as any);
				}
			});

			window.addEventListener('click', handleClick);
			window.addEventListener('popstate', handlePopstate);

			return () => {
				window.removeEventListener('click', handleClick);
				window.removeEventListener('popstate', handlePopstate);
			};
		});
	};

	#push = (url: string) => {
		state.navigating = false;
		history.pushState(null, '', sanitizeUrl(url));
	};

	#before = async (route?: InternalRoute) => {
		let props: BeforeLoadProps = route?.props || {};
		if (!route) return props;
		const before = await route.beforeLoad?.({
			params: route.params || {},
			props: route.props || {},
			query: !route.type ? route.query || {} : {}
		});
		if (typeof before === 'object') {
			if (before.error) this.error = convertErrorConfig(before.error);
			if (before.redirect) this.navigate(before.redirect);
			if (before.props) props = { ...props, ...before.props };
		}
		return props;
	};

	#parseURLParams = (opts: RouteOptions) => {
		const route = this.#routes.find((el) => el.name === opts.name);
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
		if (!path.startsWith('/')) path = '/' + path;

		return path;
	};

	#getRoute = () => {
		this.error = { status: 0, message: '' };

		const { url, query } = queryString.parseUrl(this.URL);
		const parsedURL = url.startsWith('http') ? new URL(this.URL).pathname : url;
		const urlParts = parsedURL.split('/');

		// 1-1 match, no params found.
		const plain = this.#routes.find((el) => el.path === parsedURL);
		if (plain) {
			if (query) plain.query = query;
			return plain;
		}

		// No 1-1 match, params must be present.
		const candidateRoutes = this.#routes.filter((el) => {
			let path = el.path;
			if (this.#base) {
				path = path.replace(this.#base + '/', '');
			}

			return path.startsWith('/' + urlParts[this.#base ? 2 : 1]);
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

	initialize = (config: RouterConfig) => {
		this.#base = config.base;
		this.#errors = { ...this.#errors, ...config.errors };

		this.URL = sanitizeUrl(window.location.href);

		this.#applyHandlers();

		const paths = new Map();
		const clonedRoutes = deepClone(config.routes);

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

		this.#routes = Array.from(paths).map(([_, v]: InternalPage[]) => {
			if (this.#base) v.path = `/${this.#base}${v.path}`;
			return v;
		});
	};

	render = async () => {
		const route = this.#getRoute();

		if (!route) throw new RouterError({ status: 404, message: this.#errors['404'] });
		if (this.error.status !== 0) throw new RouterError(this.error);

		let component: PageComponent | null = null;

		try {
			if (route.component.name === 'component') {
				const tmp = route.component as AsyncComponent;
				component = (await tmp()).default;
			} else {
				component = route.component;
			}

			let props: Record<string, any> = {
				...(await this.#before(route._layout)),
				...(await this.#before(route))
			};

			page.props = props;
			page.params = route.params || {};
			page.query = route.query || {};

			state.navigating = false;
			state.url = new URL(window.location.href);
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
	//
	// Public methods (exported)
	//
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
