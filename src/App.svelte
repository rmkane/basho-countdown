<script lang="ts">
  import { onMount } from 'svelte'
  import CustomIndex from './CustomIndex.svelte'
  import DemoPage from './DemoPage.svelte'

  let path = $state(typeof location !== 'undefined' ? location.pathname : '/')

  onMount(() => {
    const sync = () => {
      path = window.location.pathname
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  })
</script>

{#if path === '/demo' || path === '/demo/'}
  <DemoPage />
{:else}
  <CustomIndex />
{/if}
