<script lang="ts">
	import { Router, link } from '../lib';

	import { config } from './routes';
</script>

<Router {config}>
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		<pre>
			{err.status}
			{err.message}
		</pre>
	{/snippet}
</Router>
