<script lang="ts">
	import { link, type Layout } from '../../shepard';

	let { children }: Layout = $props();
</script>

<nav>
	<a href={link('Home')}>Home</a>
	<a href={link('Docs')}>Docs</a>
</nav>

{@render children()}
