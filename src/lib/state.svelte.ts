import qs from 'query-string';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { deepFind } from './utils';

import type { NavigateOptions, Route, RouterConfig } from './types';

export class Router {
	url = $state<URL | string>('/');
	baseUrl = $state<RouterConfig['baseURL']>();
	routes = $state<RouterConfig['routes']>([]);

	tree = $state<RouterConfig['routes']>([]);

	CurrentPage = $derived(deepFind(this.routes, (v) => v.path === this.url));
	CurrentPagePathParts = $derived(this.CurrentPage?.path.split('/').filter(Boolean));
	CurrentPageParams = $derived(
		this.CurrentPage &&
			this.CurrentPage.path
				.split('/')
				.filter(Boolean)
				.map((el) => el.startsWith(':'))
	);

	constructor(config: RouterConfig) {
		this.baseUrl = config.baseURL;
		this.routes = config.routes;

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
}
