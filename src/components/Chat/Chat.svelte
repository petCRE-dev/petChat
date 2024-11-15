<script lang="ts">
  import { onMount, afterUpdate,onDestroy } from "svelte";
  import type { DifyResponse, DifyFileResponse, UserInfo, DifySuggested } from "../../types/types";
  import Pill from "../Pill.svelte";
  import FileUploader from "./FileUploader.svelte";
  import SvelteMarkdown from "svelte-markdown";
  import CustomLink from "../CustomLink.svelte";
  import FeedbackButton from "../FeedbackButton.svelte";
  


  let query = ""; // To hold the input query
  let messages: DifyResponse[] = []; // Initialize messages array
  let isTesting = false;
  let fileToUpload: DifyFileResponse | null = null;
  let userInfo: UserInfo | null;
  let loading = false;
  let conversation_id: string | null | undefined;
  let chatMessages: HTMLElement | null;
  let suggestedMessages: Array<string> = [];

 // State tracking objects, keyed by messageId
 let likeClicked:any = {};
  let dislikeClicked:any = {};

  onMount(() => {
    const userInfoInStorage = sessionStorage.getItem("userInfo");
    userInfo = userInfoInStorage ? JSON.parse(userInfoInStorage) : null;

    chatMessages = document.getElementById("chat-messages");
  });
  onDestroy(() => {
    console.log('Chat component is destroyed');
    // Perform cleanup actions here if necessary
  });


  const getUserInfos = async () => {
    const userInfoInStorage = sessionStorage.getItem("userInfo");
    userInfo = userInfoInStorage ? JSON.parse(userInfoInStorage) : null;
  };
  function scrollToBottom() {
    chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  afterUpdate(() => {
    scrollToBottom();
  });
  function handleFeedback(type: number, rating: string | null, messageId: string) {
    // Initialize state for the message if not present
    if (!likeClicked[messageId]) likeClicked[messageId] = false;
    if (!dislikeClicked[messageId]) dislikeClicked[messageId] = false;

    if (rating === null) {
      // Reset both when the rating is null
      likeClicked[messageId] = false;
      dislikeClicked[messageId] = false;
    } else if (type === 0) { // "Like" button clicked
      likeClicked[messageId] = true;
      dislikeClicked[messageId] = false;
    } else if (type === 1) { // "Dislike" button clicked
      dislikeClicked[messageId] = true;
      likeClicked[messageId] = false;
    }
  }

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

      const lastMessage = messages.length > 1 ? messages[messages.length - 2] : null;
      await getUserInfos();
      const payload = {
        query: userMessage.answer || "Analyze the uploaded document",
        user: userInfo!.id,
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

      //console.log("Sending payload:", payload); // Debug log

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
      console.log("result", result);

      const suggestedResponse = await getSuggestedMessages(result.message_id, userInfo!.id);
      if (suggestedResponse.result === "success") {
        suggestedMessages = suggestedResponse.data;
      } else {
        suggestedMessages = [];
      }

      scrollToBottom();
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
      fileToUpload = null;
    }
  }
  async function getSuggestedMessages(messageId: string | undefined, userId: string) {
    let data: DifySuggested = { result: "failure", data: [] };
    const response = await fetch(`/api/messages/${messageId}/suggested?user=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log("error", response);
    } else {
      const response_value: DifySuggested = await response.json();
      return response_value;
    }
    return data;
  }
  async function sendSuggestedAsMessage(suggestedMessage: string) {
    query = suggestedMessage;
    await submitQuery();
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

<div id="main-grid" class="flex flex-col h-screen w-full justify-between">
  <!-- Messages Area -->
  <div id="chat-messages" class="flex-grow h-full overflow-y-auto pb-[5%] max-sm:mb-[20.5%] p-[1%] bg-accent-100 space-y-4 text-md">
    {#each messages as message}
      {#if message.role == "assistant"}
        <div class="chat chat-start">
          <div class="chat-bubble bg-primary shadow-lg shadow-accent/50 text-black whitespace-pre-wrap">
            <SvelteMarkdown source={message.answer} renderers={{ link: CustomLink }} />
            <div>
              <FeedbackButton
              userId={userInfo?.id}
              messageId={message?.message_id}
              buttonType={0}
              on:feedback={(event) => handleFeedback(0, event.detail.rating, message.message_id)}
              disabled={dislikeClicked[message.message_id] || false}
            />
            <FeedbackButton
              userId={userInfo?.id}
              messageId={message?.message_id}
              buttonType={1}
              on:feedback={(event) => handleFeedback(1, event.detail.rating, message.message_id)}
              disabled={likeClicked[message.message_id] || false}
            />
            </div>
            <!--  {message.answer} -->
            <br />
            <div class="flex flex-row flex-wrap flex-grow justify-start gap-4 md:flex-row sm:flex-col">
              {#if (message.metadata.retriever_resources ?? []).length > 0}
                
                {#each message.metadata.retriever_resources ?? [] as retriever}
                  <Pill id={retriever.segment_id} content={JSON.stringify(retriever)} counter={message.metadata.retriever_resources?.indexOf(retriever) + 1} />
                {/each}
              {/if}
            </div>
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
    {:else if suggestedMessages.length > 0}
      <div class="flex flex-row flex-wrap flex-grow justify-end gap-4 md:flex-row sm:flex-col">
        {#each suggestedMessages as suggested}
          <button class="btn btn-neutral btn-wide" on:click={async () => await sendSuggestedAsMessage(suggested)}>{suggested}</button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Input Area - Fixed at the bottom -->
  <div id="chat-input" class="flex items-center gap-2 p-4 bg-base-100 border-t border-gray-200 sticky bottom-0">
    <!-- Hidden file input for image upload -->

    <!-- <FileUploader onFileUploaded={handleFileUploaded} disabled={loading} /> -->

    <!-- Display file name if uploaded -->

    {#if loading}
      <input class="input input-bordered flex-grow" type="text" disabled placeholder="Wird bearbeitet..." />
    {:else}
      <input class="input input-bordered flex-grow" type="text" bind:value={query} on:keydown={handleKeyPress} placeholder="Eine Frage stellen..." />
    {/if}
    <button on:click={submitQuery} class="btn btn-accent btn-sm" disabled={loading}>Senden</button>
  </div>
</div>

<style>
  a {
    color: blue; /* A warm orange tone */
  }
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
