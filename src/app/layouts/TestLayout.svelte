<script lang="ts">
	import { type Layout } from '../../lib';

	let { children, params }: Layout = $props();
</script>

<div>Layout {params.id}</div>

{@render children?.()}
