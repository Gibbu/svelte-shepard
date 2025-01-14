<script lang="ts">
	import type { Layout } from '../../lib';

	let { children }: Layout = $props();
</script>

<div>AboutLayout</div>

{@render children?.()}

<style>
	div {
		background: red;
		color: lime;
	}
</style>
