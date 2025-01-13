<script lang="ts">
	import type { Page } from '../../../lib';

	let { params }: Page = $props();
</script>

<a href="/user/{params?.id}/edit">Edit {params?.id}</a>
