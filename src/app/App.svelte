<script lang="ts">
	import { Router } from '../shepard';

	import { config } from './routes';
</script>

<Router {config}>
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		<pre>
			{JSON.stringify(err)}
			{err?.status}
			{err?.message}
		</pre>
	{/snippet}
</Router>
