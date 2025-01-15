<script lang="ts">
	import { link, type Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<nav>
	<a href={link('Home')}>Home</a>
	<a href={link('Docs')}>Docs</a>
</nav>

<div>{@render children()}</div>
