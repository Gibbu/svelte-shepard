import { sanitizeUrl } from '@braintree/sanitize-url';
import { createUID, deepClone, error } from './internal/utils';

import type { InternalPage, InternalRoute, InternalRouterConfig, LayoutRoute, NavigateOptions } from './internal/types';

export class Router {
	url = $state<string>('/');
	baseUrl: InternalRouterConfig['baseURL'] = '';
	routes: InternalRouterConfig['routes'] = [];

	internalRoutes: InternalPage[] = [];

	CurrentPage = $derived.by(() => {
		const urlParts = this.url.split('/');

		// 1-1 match, no params found.
		const plain = this.internalRoutes.find((el) => el.path === this.url);
		if (plain) return plain;

		// No 1-1 match, params must be present.
		const candidateRoutes = this.internalRoutes.filter((el) => el.path.startsWith('/' + urlParts[1]));
		const route = candidateRoutes.find((el) => el.path.split('/').length === urlParts.length);
		if (!route) return this.internalRoutes[0];

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

		return route;
	});

	init = (config: InternalRouterConfig) => {
		this.baseUrl = config.baseURL;
		this.routes = config.routes;

		this.#parseRoutes();

		$effect(() => {
			this.url = this.#getURL(window.location.pathname);

			window.history.pushState = new Proxy(window.history.pushState, {
				apply: (target, thisArg, args) => {
					const URL = args[2] as URL | string;
					this.url = this.#getURL(URL);

					return target.apply(thisArg, args as any);
				}
			});

			window.addEventListener('popstate', this.#handlePopstate);
			window.addEventListener('click', this.#handleClick);

			return () => {
				window.removeEventListener('popstate', this.#handlePopstate);
				window.removeEventListener('click', this.#handleClick);
			};
		});
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

		this.internalRoutes = Array.from(paths).map(([_, v]) => v);
	};
	#push = (url: string) => {
		history.pushState(null, '', this.#getURL(url));
	};
	#handlePopstate = () => {
		this.url = this.#getURL(window.location.pathname);
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
				if (href !== this.url) this.#push(href);
			}
		}
	};

	#getURL = (url: string | URL) => {
		const u = typeof url === 'string' ? url : url.pathname;

		return sanitizeUrl(this.baseUrl ? this.baseUrl + '/' : '' + u);
	};
	#parseURL = (url: string) => {
		return url.startsWith('//') ? url.replace('/', '') : !url.startsWith('/') ? '/' + url : url;
	};

	navigate = (opts: NavigateOptions) => {
		if (typeof opts !== 'string') {
			const route = this.internalRoutes.find((el) => el.name === opts.name);
			if (!route) return error(`Cannot find a route by the unique name of: "${opts.name}"`);

			if (route.path.includes(':')) {
				const routeParams = route.path
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

				const url = route.path
					.split('/')
					.map((el) => {
						if (el.startsWith(':')) {
							const key = el.replace(':', '');
							return opts.params![key];
						}
						return el;
					})
					.join('/');

				this.#push(this.#getURL(url));
			}
		} else {
			this.#push(this.#getURL(opts));
		}
	};
}
