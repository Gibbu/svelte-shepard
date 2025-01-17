<script lang="ts">
	import { type Page } from '../../../lib';

	let { params, props }: Page<{ params: { id: string } }> = $props();
</script>

{params.id}
