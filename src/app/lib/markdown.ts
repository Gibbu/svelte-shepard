import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkExtract from 'remark-extract-frontmatter';
import { parse as yaml } from 'yaml';

export const markdown = async (content: string) => {
	const md = await unified()
		.use(remarkParse)
		.use(remarkFrontmatter, 'yaml')
		.use(remarkExtract, { yaml })
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypeSlug)
		.use(rehypeStringify)
		.process(content);

	return {
		meta: md.data as Record<string, string>,
		result: md.value
	};
};

export const findPage = async (glob: Record<string, () => Promise<unknown>>, id: string) => {
	const pages = Object.entries(glob);
	let page: string | null = null;

	for (const [path, resolver] of pages) {
		const _path = path.replace(/\/src\/docs\/|.md|\/index/g, '');
		if (_path === id || (!id.includes('/') && _path === 'index' && id === '')) {
			page = (await resolver()) as string;
			break;
		}
	}

	return page;
};
