import type { ErrorConfig } from './types';

export const convertErrorConfig = (opts: ErrorConfig) => {
	const status = typeof opts === 'object' ? opts.status : opts;
	const message = typeof opts === 'object' ? opts.message : '';
	return { status, message };
};

export class RouterError extends Error {
	status: number = 0;
	constructor(opts: ErrorConfig) {
		const { status, message } = convertErrorConfig(opts);

		super(message);
		this.name = 'RouterError';

		this.status = status;
	}
}
