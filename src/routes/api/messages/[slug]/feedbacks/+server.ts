import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
export const POST: RequestHandler = async ({ params, request }) => {
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;

  try {
    const requestBody = await request.json();
    const response = await fetch(`https://api.dify.ai/v1/messages/${params.slug}/feedbacks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Dify API Error:", errorData);

      return new Response(
        JSON.stringify({
          error: "Failed to post data to Dify API",
          details: errorData.message || "Unknown error",
          code: errorData.code,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }
    const data = await response.json();
    console.log(data);


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
      { status: 500 , headers: { "Content-Type": "application/json" }}
    );
  }
};
