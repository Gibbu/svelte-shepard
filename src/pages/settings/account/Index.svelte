<script lang="ts">
	import type { Snippet } from 'svelte';

	let { Child }: { Child?: Snippet } = $props();
</script>

<h2>Settings account index</h2>

<a href="/settings/account/avatar">Avatar</a>
<a href="/settings/account/password">Password (lazy)</a>

{@render Child?.()}
