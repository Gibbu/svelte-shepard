<script lang="ts">
	import { type Page } from '../../../shepard';

	let { params, props }: Page<{ params: { id: string } }> = $props();
</script>

{@html props.result}
