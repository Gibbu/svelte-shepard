import { sanitizeUrl } from '@braintree/sanitize-url';
import { deepFind } from './utils';

import type { NavigateOptions, Route, RouterConfig } from './types';

export class Router {
	url = $state<URL | string>('/');
	baseUrl = $state<RouterConfig['baseURL']>();
	routes = $state<RouterConfig['routes']>([]);

	truncatedRoutes = $state<{ id: string; path: string }[]>([]);

	CurrentPage = $derived.by(() => {
		const parent = this.url.toString().split('/').slice(1, 2)[0];

		return deepFind(this.routes, (v) => v.path === '/' + parent);
	});
	// CurrentPagePathParts = $derived(this.CurrentPage?.path.split('/').filter(Boolean));
	// CurrentPageParams = $derived(
	// 	this.CurrentPage &&
	// 		this.CurrentPage.path
	// 			.split('/')
	// 			.filter(Boolean)
	// 			.map((el) => el.startsWith(':'))
	// );

	constructor(config: RouterConfig) {
		this.baseUrl = config.baseURL;
		this.routes = config.routes;

		$inspect(this.url, this.CurrentPage, this.truncatedRoutes);

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
	}

	#parseRoutes = () => {
		let paths = new Map();

		for (let i = 0; i < this.routes.length; i++) {
			const parent = this.routes[i];

			let pathBits: string[] = [this.#parseURL(parent.path)];
			paths.set(parent.name, pathBits.join(''));

			const loop = (arr: Route[], prev?: Route) => {
				for (let i = 0; i < arr.length; i++) {
					const child = arr[i];

					pathBits.push(child.path);
					paths.set(child.name, pathBits.join(''));

					if (child.children) loop(child.children, child);

					if (prev) pathBits = [parent.path, prev.path];
				}
			};

			if (parent.children) loop(parent.children);
		}

		this.truncatedRoutes = Array.from(paths).map(([k, v]) => ({ id: k, path: v }));
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
		return url.startsWith('//') ? url.replace('/', '') : url;
	};

	navigate = (opts: NavigateOptions) => {
		if ('name' in opts) {
			const route = deepFind(this.routes, (v) => v.name === opts.name);
			if (route) {
				// If params, place params in the correct spot and parse
			}
		} else {
			this.#push(opts.url);
		}
	};
}
