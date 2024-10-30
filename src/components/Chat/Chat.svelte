<script lang="ts">
  import { onMount } from "svelte";
  import type { DifyResponse } from "../../types/types";
  let query = ""; // To hold the input query
  let messages: DifyResponse[] = []; // Initialize messages array
  async function submitQuery() {
    try {
      let userMessage: DifyResponse = {
        answer: query,
        role: "user",
      };
      messages = [...messages, userMessage];
      query = "";
      // Define the payload to send to the endpoint
      const payload = {
        query: userMessage.answer,
        response_mode: "blocking",
        conversation_id: "",
        user: "abc-123",
        files: [],
        inputs: {},
      };

      // Send a POST request to the endpoint
      const response = await fetch("/api/chat-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result: DifyResponse = await response.json();
      result.role = "assistant";
      messages = [...messages, result];

      // Log or display the result as needed
    } catch (error) {
      console.error(error); // Handle errors gracefully
    }
  }
</script>

<div id="main-grid" class="flex flex-col h-screen w-full">
  <!-- Messages Area -->
  <div
    id="chat-messages"
    class="flex-grow overflow-y-auto p-4 bg-base-200 space-y-4"
  >
    {#each messages as message}
    {#if message.role=="assistant"}
    <div class="chat chat-start">
      <div class="chat-bubble bg-primary text-white">{message.answer}</div>
    </div>
      {:else}
      <div class="chat chat-end">
        <div class="chat-bubble bg-primary text-white">{message.answer}</div>
      </div>
    {/if}
     
    {/each}
    <!-- Example messages (replace with dynamic content) -->

    <!-- More dynamic messages here -->
  </div>

  <!-- Input Area - Fixed at the bottom -->
  <div
    id="chat-input"
    class="flex items-center gap-2 p-4 bg-base-100 border-t border-gray-200 sticky bottom-0"
  >
    <input
      class="input input-bordered flex-grow"
      type="text"
      bind:value={query}
      placeholder="Enter your query"
    />
    <button on:click={submitQuery} class="btn btn-primary btn-sm">
      Submit Query
    </button>
  </div>
</div>
