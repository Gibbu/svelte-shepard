<script lang="ts">
	import type { Snippet } from 'svelte';

	let { Child }: { Child?: Snippet } = $props();
</script>

<h1>Settings index</h1>

<a href="/settings/account">Account</a>

{@render Child?.()}
