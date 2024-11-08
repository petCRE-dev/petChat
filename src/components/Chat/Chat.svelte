<script lang="ts">
  import { onMount } from "svelte";
  import type { DifyResponse, DifyFileResponse } from "../../types/types";
  import Pill from "../Pill.svelte";
  import FileUploader from "./FileUploader.svelte";

  let query = ""; // To hold the input query
  let messages: DifyResponse[] = []; // Initialize messages array
  let isTesting = false;
  let fileToUpload: DifyFileResponse | null = null;

  let loading = false;
  let conversation_id: string | null | undefined;

  // Chat.svelte
  async function submitQuery() {
    if (!query.trim() && !fileToUpload) return;

    loading = true;
    try {
      let userMessage: DifyResponse = {
        answer: query,
        role: "user",
        metadata: {},
        fileinput: fileToUpload
          ? {
              file: null,
              filename: fileToUpload.name,
              thumbnail: fileToUpload.thumbnailUrl,
            }
          : undefined,
      };
      messages = [...messages, userMessage];

      query = "";

      // Map file extensions to Dify's supported types
      const getFileType = (filename: string): string => {
        const ext = filename.toLowerCase().split(".").pop() || "";
        switch (ext) {
          case "pdf":
            return "PDF";
          case "doc":
          case "docx":
            return "DOC";
          case "txt":
            return "TXT";
          case "csv":
            return "CSV";
          case "xls":
          case "xlsx":
            return "XLS";
          default:
            return "TXT";
        }
      };

      const lastMessage = messages.length > 1 ? messages[messages.length - 2] : null;

      const payload = {
        query: userMessage.answer || "Analyze the uploaded document",
        user: "abc-123",
        response_mode: "blocking",
        conversation_id: lastMessage?.conversation_id || null,
        files: fileToUpload
          ? [
              {
                type: "document", // This will return one of: PDF, DOC, TXT, CSV, XLS
                transfer_method: "local_file",
                upload_file_id: fileToUpload.id,
              },
            ]
          : [],
        inputs: {},
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await fetch("/api/chat-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chat error:", errorData);
        throw new Error(errorData.details || errorData.error || "Failed to send message");
      }

      const result: DifyResponse = await response.json();
      result.role = "assistant";
      messages = [...messages, result];
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
      fileToUpload = null;
    }
  }
  // Function triggered when file input changes (file is selected)
  function handleFileUploaded(file: DifyFileResponse) {
    fileToUpload = file;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !loading && query.length > 0) {
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
          <div class="chat-bubble bg-primary shadow-lg shadow-accent/50 text-black whitespace-pre-wrap">
            {message.answer}
            <br />
            <span class="flex gap-2">
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
            {#if message.fileinput && message.fileinput.thumbnail}
              <img src={message.fileinput.thumbnail} alt="Uploaded file" class="thumbnail" />
            {/if}
            <p>{message.answer}</p>
          </div>
        </div>
      {/if}
    {/each}
    <!-- Loading Bubble (visible while waiting for assistant's response) -->
    {#if loading}
      <div class="chat chat-start">
        <div class="chat-bubble loading-bubble bg-primary">
          <div class="dot-typing"></div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input Area - Fixed at the bottom -->
  <div id="chat-input" class="flex items-center gap-2 p-4 bg-base-100 border-t border-gray-200 sticky bottom-0">
    <!-- Hidden file input for image upload -->

    <FileUploader onFileUploaded={handleFileUploaded} disabled={loading} />

    <!-- Display file name if uploaded -->

    {#if loading}
      <input class="input input-bordered flex-grow" type="text" disabled placeholder="Wird bearbeitet..." />
    {:else}
      <input class="input input-bordered flex-grow" type="text" bind:value={query} on:keydown={handleKeyPress} placeholder="Eine Frage stellen..." />
    {/if}
    <button on:click={submitQuery} class="btn btn-accent btn-sm">Senden</button>
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
    width: 150px;
    height: 150px;
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
    content: "";
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
