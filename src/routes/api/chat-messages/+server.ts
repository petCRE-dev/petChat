// src/routes/api/chat-messages/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { DifyResponse } from "../../../types/types";


// api/chat-messages/+server.ts
export const POST: RequestHandler = async ({ request }) => {
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;
  
  try {
    const requestData = await request.json();
    
    // Validate file type if files are present
    

    console.log('Sending to Dify:', requestData);

    const response = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Dify API Error:', errorData);
      
      return new Response(JSON.stringify({
        error: "Failed to post data to Dify API",
        details: errorData.message || 'Unknown error',
        code: errorData.code
      }), { status: response.status });
    }

    const data: DifyResponse = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({
      error: "Request failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
};