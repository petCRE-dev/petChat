<script lang="ts">
  import { onMount } from "svelte";
  import type { DifyResponse } from "../../types/types";
  import Pill from "../Pill.svelte";
  let query = ""; // To hold the input query
  let messages: DifyResponse[] = []; // Initialize messages array
  let isTesting = false;
  let scrollTarget: HTMLDivElement ;
  async function submitQuery() {
    if (isTesting) {
      messages = [
        ...messages,
        {
          role: "assistant",
          event: "message",
          task_id: "a0e3b903-e1bf-41b2-b08a-cdd05c9032dc",
          id: "b4772cef-796c-45d3-823b-420bcd77cb71",
          message_id: "b4772cef-796c-45d3-823b-420bcd77cb71",
          conversation_id: "5e2fbeb2-6df3-47e1-ac02-a271b6f02892",
          mode: "chat",
          answer:
            "It looks like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today?",
          metadata: {},
        }, {
          role: "user",
          event: "message",
          task_id: "a0e3b903-e1bf-41b2-b08a-cdd05c9032dc",
          id: "b4772cef-796c-45d3-823b-420bcd77cb71",
          message_id: "b4772cef-796c-45d3-823b-420bcd77cb71",
          conversation_id: "5e2fbeb2-6df3-47e1-ac02-a271b6f02892",
          mode: "chat",
          answer:
            "It looks like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today? like you might be testing. How can I assist you today?",
          metadata: {},
        }
      ];
    } else {
      try {
        let userMessage: DifyResponse = {
          answer: query,
          role: "user",
          metadata: {},
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
  }
   // Scroll to the bottom when a new message is added
   $: if (messages.length) {
    scrollTarget?.scrollIntoView({ behavior: "smooth" });
  }
</script>

<div id="main-grid" class="flex flex-col h-screen w-full">
  <!-- Messages Area -->
  <div id="chat-messages" class="flex-grow h-full overflow-y-auto mb-[3.5%] p-[1%] bg-accent-100 space-y-4">
    {#each messages as message}
      {#if message.role == "assistant"}
        <div class="chat chat-start">
          <div class="chat-bubble bg-primary shadow-lg shadow-accent/50   text-black">
            {message.answer}
            <br />
            <span>
              {#if (message.metadata.retriever_resources ?? []).length > 0}
                {#each message.metadata.retriever_resources ?? [] as retriever}
                  <Pill id={retriever.segment_id} content={JSON.stringify(retriever)} />
                {/each}
              {/if}
            </span>
          </div>
        </div>
      {:else}
        <div class="chat chat-end">
          <div class="chat-bubble">{message.answer}</div>
        </div>
      {/if}
    {/each}
    <!-- Example messages (replace with dynamic content) -->
    
    <!-- More dynamic messages here -->
  </div>

  <!-- Input Area - Fixed at the bottom -->
  <div id="chat-input" class="flex items-center gap-2 p-4 bg-base-100 border-t border-gray-200 sticky bottom-0">
    <input class="input input-bordered flex-grow" type="text" bind:value={query} placeholder="Enter your query" />
    <button on:click={submitQuery} class="btn btn-accent btn-sm"> Submit Query </button>
  </div>
</div>
