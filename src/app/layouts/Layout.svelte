<script lang="ts">
	import { mapRoute, link, type Layout } from '../../shepard';

	let { children }: Layout = $props();
</script>

<nav>
	<a use:link href={mapRoute('Home')}>Home</a>
	<a use:link href={mapRoute('Docs')}>Docs</a>
</nav>

{@render children()}
