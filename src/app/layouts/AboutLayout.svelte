<script lang="ts">
	import type { Layout } from '../../lib';

	let { children, query }: Layout = $props();
</script>

<pre>
	{JSON.stringify(query)}
</pre>

AboutLayout

{@render children?.()}
