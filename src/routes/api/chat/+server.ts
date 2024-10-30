
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
export const GET: RequestHandler = async ()=>{

    const secretKey = env.PUBLIC_VITE_DIFY_API_KEY
    //const url = 'https://api.dify.ai/v1/messages?user=default-user&conversation_id='
    const url = 'https://api.dify.ai/v1/conversations?user=default-user&last_id=&limit=20'
    try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${secretKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return new Response(JSON.stringify({ error: 'Failed to fetch data from external API',key:secretKey }), {
				status: response.status
			});
		}

		const data = await response.json();
		return new Response(JSON.stringify(data), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Request failed' }), { status: 500 });
	}
}