<script lang="ts">
	import { mapRoute } from '../../../shepard';
</script>

<a href={mapRoute('DocsPage', { params: { id: 'test' } })}>test</a>
<a href={mapRoute('DocsPage', { params: { id: 'wowzers' } })}>wowzers</a>
