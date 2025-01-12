<script lang="ts">
	import type { Snippet } from 'svelte';

	let { params, children }: { children: Snippet; params: Record<string, any> } = $props();
</script>

{params.id}

<a href="/user/{params.id}/edit">Edit {params.id}</a>

{@render children?.()}
