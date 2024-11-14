<script lang="ts">
    import Fa from "svelte-fa";
    import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
    import { createEventDispatcher } from 'svelte';
  
    enum ButtonType {
      T_UP = 0,
      T_DOWN = 1,
    }
  
    export let buttonType: number;
    export let messageId: string | undefined;
    export let userId: string | undefined;
    export let disabled: boolean = false;
  
    let clicked = false;
    let feedbackType = buttonType === ButtonType.T_UP ? "like" : "dislike";
  
    const dispatch = createEventDispatcher();
  
    async function sendFeedback() {
      let payload = {
        rating: null as string | null,
        user: userId,
      };
  
      if (!clicked) {
        payload.rating = feedbackType;
        clicked = true;
      } else {
        payload.rating = null;
        clicked = false;
      }
  console.log(payload)
      // Dispatch the feedback status to the parent
      dispatch('feedback', { rating: payload.rating });
  
      const response = await fetch(`/api/messages/${messageId}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      console.log(await response.json());
    }
  </script>
  
  <button
    class="btn btn-sm btn-circle btn-outline hover:btn-secondary"
    on:click={sendFeedback}
    aria-label={feedbackType === "like" ? "Like" : "Dislike"}
    disabled={disabled}
  >
    <Fa icon={feedbackType === "like" ? faThumbsUp : faThumbsDown} class={clicked ? (feedbackType === "like" ? "text-success" : "text-error") : "text-neutral"} />
  </button>
  