<script lang="ts">
  import { onMount } from "svelte";
  import type { DifyResponse, DifyFileResponse } from "../../types/types";
  import Pill from "../Pill.svelte";

  let query = ""; // To hold the input query
  let messages: DifyResponse[] = []; // Initialize messages array
  let isTesting = false;
  let fileToUpload: DifyFileResponse | null = null;
  let uploadedFileName = ""; // To hold the name of the uploaded file for display
  let thumbnailUrl: string | null = null; // Holds the data URL for the thumbnail
  let loading = false;

  async function submitQuery() {
    if (isTesting) {
      messages = [
        // Testing message objects
      ];
    } else {
      try {
        loading = true;
        let userMessage: DifyResponse = {
          answer: query,
          role: "user",
          metadata: {},
          fileinput: fileToUpload ? { file: null, filename: uploadedFileName } : undefined, // Add file to message if uploaded
        };
        messages = [...messages, userMessage];
        query = "";

        // Define the payload to send to the endpoint
        const payload = {
          query: userMessage.answer,
          response_mode: "blocking",
          conversation_id: "",
          user: "abc-123",
          files: fileToUpload
            ? [
                {
                  type: "image",
                  transfer_method: "local_file",
                  upload_file_id: fileToUpload.id,
                },
              ]
            : [],
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
      } catch (error) {
        console.error(error); // Handle errors gracefully
      } finally {
        loading = false;
        fileToUpload = null; // Reset fileToUpload after use
        uploadedFileName = ""; // Clear the displayed filename after sending
        thumbnailUrl = null;
      }
    }
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", "abc-123"); // or dynamically set based on your app's logic

    try {
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to upload file to external API");
        return;
      }

      const data = await response.json();
      fileToUpload = data;
      uploadedFileName = file.name; // Set the file name for visual feedback
      // Create a data URL for the thumbnail preview
      const reader = new FileReader();
      reader.onload = () => {
        thumbnailUrl = reader.result as string;
      };
      reader.readAsDataURL(file); // Generate the data URL for the image file
    } catch (error) {
      console.error("Request failed", error);
    }
  }

  // Function triggered when file input changes (file is selected)
  function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  }
  function handleKeyPress(event:KeyboardEvent){
    if(event.key==="Enter" &&!loading&& query.length>0){
      submitQuery();
    }
  }
</script>

<div id="main-grid" class="flex flex-col h-screen w-full">
  <!-- Messages Area -->
  <div id="chat-messages" class="flex-grow h-full overflow-y-auto mb-[3.5%] p-[1%] bg-accent-100 space-y-4">
    {#each messages as message}
      {#if message.role == "assistant"}
        <div class="chat chat-start">
          <div class="chat-bubble bg-primary shadow-lg shadow-accent/50 text-black">
            {message.answer}
            <br />
            <span class="flex  gap-2">
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
          <div class="chat-bubble">
            {message.answer}
            {#if message.fileinput && thumbnailUrl}
              <img src={thumbnailUrl} alt="Uploaded thumbnail" class="thumbnail" />
              <!-- Display uploaded file name or thumbnail -->
              <div class="uploaded-file-preview mt-2 text-xs text-gray-500">
                📎 {message.fileinput.filename}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
    <!-- Loading Bubble (visible while waiting for assistant's response) -->
    {#if loading}
      <div class="chat chat-start ">
        <div class="chat-bubble loading-bubble bg-primary">
          <div class="dot-typing"></div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input Area - Fixed at the bottom -->
  <div id="chat-input" class="flex items-center gap-2 p-4 bg-base-100 border-t border-gray-200 sticky bottom-0">
    <div class="image-upload">
      <label for="file-input" class="cursor-pointer">
        <!-- SVG icon for file upload -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24">
          <path
            d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 192 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-64z"
          />
        </svg>
      </label>
      <!-- Hidden file input for image upload -->
      <input type="file" id="file-input" class="hidden" accept="image/jpeg" on:change={handleFileChange} />
    </div>
    <!-- Display file name if uploaded -->
    {#if uploadedFileName}
      <div class="uploaded-file-preview text-xs text-gray-500">
        {uploadedFileName}
      </div>
    {/if}
{#if loading}
<input class="input input-bordered flex-grow" type="text" disabled  placeholder="Enter your query" />
  {:else}

  <input class="input input-bordered flex-grow" type="text" bind:value={query} on:keydown={handleKeyPress} placeholder="Enter your query" />
{/if}
    <button on:click={submitQuery} class="btn btn-accent btn-sm">Submit Query</button>
  </div>
</div>


<style>
  .image-upload > input {
    display: none;
  }
  .uploaded-file-preview {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .thumbnail {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
  }
  .loading-bubble {
    background-color: #e0e0e0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 70px;
  }
  .dot-typing {
    width: 8px;
    height: 8px;
    background-color: #333;
    border-radius: 50%;
    display: inline-block;
    animation: dotTyping 1s infinite linear;
    position: relative;
  }
  .dot-typing::before,
  .dot-typing::after {
    content: '';
    width: 8px;
    height: 8px;
    background-color: #333;
    border-radius: 50%;
    position: absolute;
    animation: dotTyping 1s infinite linear;
  }
  .dot-typing::before {
    left: -12px;
    animation-delay: 0.2s;
  }
  .dot-typing::after {
    right: -12px;
    animation-delay: 0.4s;
  }
  @keyframes dotTyping {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }
</style>
