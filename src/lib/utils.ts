type DeepELement<T> = Record<string, any> | T[];

export const deepFind = <T>(array: DeepELement<T>, predicate: (v: T) => boolean): T | null => {
	let result: T | T[] | null = null;

	const loop = (item: Record<string, any> | any[]) => {
		if (result) return;
		else if (Array.isArray(item)) {
			for (let i = 0; i < item.length; i++) {
				const element = item[i];
				if (predicate(element)) result = element;
				else loop(element);
			}
		} else if (typeof item === 'object') {
			for (const key in item) {
				const element = item[key];
				if (predicate(element)) result = element;
				else loop(element);
			}
		}
	};

	loop(array);

	return result;
};
