<script lang="ts">
	import type { Layout } from '../../shepard';

	let { children }: Layout = $props();
</script>

<aside>sidebar</aside>
<main>
	{@render children()}
</main>
