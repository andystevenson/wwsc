<script lang="ts">
  	import type { PageData } from './$types';

  import { page } from '$app/stores';
  let status = $page.status;
  let message = $page.error?.message;
  let { data }: { data: PageData } = $props();
</script>
<h2>{$page.url.pathname.slice(1)}</h2>
<pre>{JSON.stringify(data, null, 2)}</pre>
