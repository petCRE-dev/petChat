import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";


export const GET:RequestHandler=async({params,url})=>{

    const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;

    try {
     // const requestData = await params.json();
      
      // Validate file type if files are present
      
  
    
    const userId = url.searchParams.get("userId");
  const conversationId = url.searchParams.get("conversation_id");
  console.log(conversationId)
const messagesResponse=await fetch(`https://api.dify.ai/v1/messages?user=${userId}&conversation_id=${conversationId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  },});
  const messages = await messagesResponse.json();
  console.log("Messages:", messages);


      const response = await fetch(`https://api.dify.ai/v1/messages/${params.slug}/suggested?user=${params.userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(requestData),
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
  
      const data: any = await response.json();
      console.log("response:",data)
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