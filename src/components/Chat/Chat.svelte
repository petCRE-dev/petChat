<script lang="ts">
	import { onMount } from 'svelte';

	let query = ''; // To hold the input query

	async function submitQuery() {
		try {
			// Define the payload to send to the endpoint
			const payload = {
				query: query,
				response_mode: "blocking",
				conversation_id: "",
				user: "abc-123",
				files: [
				
				],
        inputs:{}
			};

			// Send a POST request to the endpoint
			const response = await fetch('/api/chat-messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			// Handle the response
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}

			const result = await response.json();
			console.log('Response:', result); // Log or display the result as needed
		} catch (error) {
			console.error(error); // Handle errors gracefully
		}
	}
</script>

<!-- HTML Structure -->
<div>
	<input class="inuput"
		type="text"
		bind:value={query}
		placeholder="Enter your query"
	/>

	<button on:click={submitQuery} class="btn btn-sm border-2">
		Submit Query
	</button>
</div>

