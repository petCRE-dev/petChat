<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton";
    import { env } from '$env/dynamic/public';
  
    let currentMessage: string = "";
    const API_KEY = env.PUBLIC_VITE_DIFY_API_KEY; // Store this securely!

    $:conversationId="";
    $:console.log(conversationId);

    type Message = {
      name: string;
      message: string;
      timestamp: string;
      avatar: number;
    };
  
    let chat = {
      uuid: "",
      userName: "User",
      messages: [] as Message[],
    };
     async function sendToDify(message: string) {
        try {
            const response = await fetch('https://api.dify.ai/v1/chat-messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: {},
                    query: message,
                    response_mode: "streaming",
                    conversation_id: conversationId,
                    user: chat.uuid || "default-user"
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Response body is null');
            }

            let botResponse = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Convert the chunk to text
                const text = new TextDecoder().decode(value);
                // Split the text into lines
                const lines = text.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    // Remove the "data: " prefix and parse the JSON
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6); // Remove "data: "
                            const parsedData = JSON.parse(jsonStr);
                            
                            if (parsedData.event === 'message') {
                                botResponse += parsedData.answer || '';
                                if (parsedData.conversation_id) {
                                    conversationId = parsedData.conversation_id;
                                }
                            } else if (parsedData.event === 'error') {
                                throw new Error(parsedData.message || 'Unknown error');
                            }
                        } catch (e) {
                            console.error('Error parsing line:', line, e);
                        }
                    }
                }
            }

            return botResponse;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, there was an error processing your message.';
        }
    }
let isLoading =false;

async function sendMessage() {
        if (currentMessage.trim()) {
            isLoading = true;
            
            // Add user message
            chat.messages = [
                ...chat.messages,
                {
                    name: chat.userName || "User",
                    message: currentMessage,
                    timestamp: new Date().toLocaleTimeString(),
                    avatar: Math.floor(Math.random() * 70) + 1,
                },
            ];

            const userMessage = currentMessage;
            currentMessage = ""; // Clear input

            try {
                // Get bot response
                const botResponse = await sendToDify(userMessage);
                
                // Add bot message
                chat.messages = [
                    ...chat.messages,
                    {
                        name: "System",
                        message: botResponse,
                        timestamp: new Date().toLocaleTimeString(),
                        avatar: 0,
                    },
                ];
            } catch (error) {
                console.error('Error sending message:', error);
                // Add error message to chat
                chat.messages = [
                    ...chat.messages,
                    {
                        name: "System",
                        message: "Sorry, there was an error processing your message.",
                        timestamp: new Date().toLocaleTimeString(),
                        avatar: 0,
                    },
                ];
            } finally {
                isLoading = false;
            }
        }
    }
  </script>
  
  <div class="min-h-screen flex flex-col">
    <!-- Chat Container -->
    <div
    class="bg-secondary-200 w-full p-5 border-4 rounded-xl border-accent-900 overflow-y-auto flex-grow space-y-5"
  >
    {#if chat.messages.length > 0}
      {#each chat.messages as message}
        {#if message.name !== "System"}
          <!-- User Message -->
          <div class="grid grid-cols-[1fr_auto] gap-2 items-start">
            <div class="card p-4 rounded-tr-none space-y-2 !bg-primary-500 text-white self-end">
              <header class="flex justify-between items-center">
                <p class="font-bold">{message.name}</p>
                <small class="opacity-50">{message.timestamp}</small>
              </header>
              <p>{message.message}</p>
            </div>
            <Avatar
              border="border-4 border-surface-300-600-token !border-primary-500"
              width="w-12"
            >you</Avatar>
          </div>
        {:else}
          <!-- Bot Message -->
          <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
            <Avatar width="w-12" background="bg-tertiary-500" border="border-4 border-surface-300-600-token !border-primary-500">bot</Avatar>
            <div class="card p-4 rounded-tl-none space-y-2 !bg-tertiary-500 text-black">
              <header class="flex justify-between items-center">
                <p class="font-bold">{message.name}</p>
                <small class="opacity-50">{message.timestamp}</small>
              </header>
              <p>{message.message}</p>
            </div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
  
    <!-- Fixed Input Box -->
    <div
      class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token bg-white border-t border-gray-200 p-3 sticky bottom-0"
    >
      <button class="input-group-shim text-gray-500">+</button>
      <input
        bind:value={currentMessage}
        class="bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none"
        name="prompt"
        id="prompt"
        placeholder="Gebe eine Nachricht ein..."
      type="text"
      />
      <button class="variant-filled-primary rounded-md" on:click={sendMessage} >Senden</button>
    </div>
  </div>
  