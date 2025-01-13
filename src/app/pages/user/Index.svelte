<script lang="ts">
	import type { Page } from '../../../lib';

	let { params, query }: Page = $props();
</script>

<a href="/user/{params.id}/edit">Edit {params.id}</a>

<pre>
	{JSON.stringify(params)}
</pre>
<pre>
	{JSON.stringify(query)}
</pre>
