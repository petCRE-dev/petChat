<script lang="ts">
  import { onMount } from "svelte";
  import SvelteMarkdown from "svelte-markdown";

  export let id: string;
  export let content: string;
  export let counter: number = 0;

  // Parse the JSON content and format it
  let formattedContent: string;

  onMount(() => {
    try {
      // Safely parse and format the content as JSON
      formattedContent = "```\n" + JSON.stringify(JSON.parse(content), null, 2) + "\n```";
    } catch (error) {
      console.error("Invalid JSON content", error);
      formattedContent = "Invalid JSON content.";
    }
  });

  // Function to open the modal by ID and reset scroll position
  function openModal() {
    const modal = document.getElementById(`my_modal_${id}`) as HTMLDialogElement;
    modal?.showModal();

    // Ensure scroll position is at the top
    const scrollableContent = modal?.querySelector("pre");
    if (scrollableContent) {
      scrollableContent.scrollTop = 0;
    }
  }
</script>

<!-- Button to open the modal -->
<button class="btn btn-wide btn-sm text-center shadow-md" on:click={openModal}>
  Quelle-{counter}
</button>

<!-- Modal Dialog with dynamic ID -->
<dialog id={`my_modal_${id}`} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg text-black">{JSON.parse(content).document_name}</h3>
    
    <!-- Preformatted JSON content with limited height and scrollable overflow -->
    <pre class="py-4 text-black bg-gray-100 p-4 rounded" style="overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">
      <SvelteMarkdown source={formattedContent}></SvelteMarkdown>
    </pre>
    <p class="prose" style="overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">
      {JSON.parse(content).content.split(';').join('\n')}
    </p>
    <p class="text-black">score: {JSON.parse(content).score}</p>
    <p class="text-black">dataset: {JSON.parse(content).dataset_name}</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- Button to close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
