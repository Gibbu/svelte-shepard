<script lang="ts">
	import type { Page } from '../../../lib';

	let { params, query }: Page = $props();
</script>

<pre>
	{JSON.stringify(params)}
</pre>
<pre>
	{JSON.stringify(query)}
</pre>
