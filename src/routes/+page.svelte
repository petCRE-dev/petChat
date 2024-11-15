<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import Chat from "../components/Chat/Chat.svelte";
	import { onMount } from "svelte";
//used to force reload of component
let chatKey = 0;
  function resetChat() {
    chatKey++;
  }
  // Listen to the custom "newChat" event from the layout
  onMount(() => {
    window.addEventListener('newChat', resetChat);
    return () => window.removeEventListener('newChat', resetChat);
  });
</script>

{#key chatKey}
  <Chat />
{/key}


