<script lang="ts">
	import { state, type Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<div>{state.navigating}</div>
<div>{state.page.name}</div>
<div>{state.page.path}</div>

<nav>
	<a href="/">Home</a>
	<a href="/test">Test</a>
</nav>

<div>{@render children()}</div>
