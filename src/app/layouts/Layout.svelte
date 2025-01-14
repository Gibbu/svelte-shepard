<script lang="ts">
	import { state, type Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/docs">Docs</a>
</nav>

<div>{@render children()}</div>
