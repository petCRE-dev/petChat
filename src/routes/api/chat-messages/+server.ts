import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { DifyResponse } from "../../../types/types";

export const POST: RequestHandler = async ({ request }) => {
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;
  const requestData = await request.json();
  const payload = {
    ...requestData,
  };
  try {
    const response = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Handle the response
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to post data to external API" }),
        {
          status: response.status,
        }
      );
    }

    const data:DifyResponse = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
    });
  }
};
