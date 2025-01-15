import type { ErrorConfig } from './types';

export const log = {
	error: (...message: string[]): never => {
		throw new Error(`[svelte-shepard] ${message.join('\n')}`);
	}
};

export const createUID = () => {
	const UID_SET = 'qwertyuiopasdfghjklzxcvbnm1234567890_-';

	let uid: string = '';

	for (let i = 0; i < 9; i++) {
		uid += UID_SET.charAt(Math.floor(UID_SET.length * Math.random()));
	}

	return uid;
};

export const deepClone = <T>(arr: T[]): T[] => {
	return arr.map((el) => (Array.isArray(el) ? deepClone(el) : el)) as T[];
};
