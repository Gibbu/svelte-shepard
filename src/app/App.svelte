<script lang="ts">
	import { Router } from '../lib';

	import { config } from './routes';
</script>

<Router {config}>
	{#snippet loading()}
		<p>Loading...</p>
	{/snippet}
	{#snippet error(err)}
		SOME SORT OF ERROR?
		<pre>
			{err}
		</pre>
	{/snippet}
</Router>
