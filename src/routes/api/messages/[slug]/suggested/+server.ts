import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { DifySuggested } from "../../../../../types/types";

export const GET: RequestHandler = async ({ params, url }) => {
 
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;

  try {
    const userId = url.searchParams.get("user");

    const response = await fetch(`https://api.dify.ai/v1/messages/${params.slug}/suggested?user=${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });
    const data: DifySuggested = await response.json();
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Dify API Error:", errorData);

      return new Response(
        JSON.stringify({
          error: "Failed to post data to Dify API",
          details: errorData.message || "Unknown error",
          code: errorData.code,
        }),
        { status: response.status }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};
