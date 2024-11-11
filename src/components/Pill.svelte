
<script lang="ts">
  import { onMount } from "svelte";

    export let id: string;
    export let content: string;
    export let counter:number=0;
    onMount(()=>{
     
    })
    // Function to open the modal by ID
    function openModal() {
      const modal = document.getElementById(`my_modal_${id}`) as HTMLDialogElement;
      modal?.showModal();
    }
  </script>
  
  <!-- Button to open the modal -->
  <button class="btn btn-xs     text-center shadow-md" on:click={openModal}>Quelle-{counter}</button>
  
  <!-- Modal Dialog with dynamic ID -->
  <dialog id={`my_modal_${id}`} class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-black">{JSON.parse(content).document_name}</h3>
    
      <p class="py-4 text-black">{JSON.parse(content).content}</p>
      <p class="py-4 text-black">score: {JSON.parse(content).score}</p>
      <p class="py-4 text-black">dataset: {JSON.parse(content).dataset_name}</p>
      <div class="modal-action">
        <form method="dialog">
          <!-- Button to close the modal -->
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
  