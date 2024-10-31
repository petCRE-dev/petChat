import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { DifyFileResponse } from "../../../types/types";

export const POST: RequestHandler = async ({ request }) => {
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;
  const formData = await request.formData();
  const file = formData.get("file");
  const user = formData.get("user");

  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: "File is required" }), {
      status: 400,
    });
  }

  // Prepare the multipart/form-data body
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("user", user as string);
  try {
    const response = await fetch("https://api.dify.ai/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        body: uploadFormData,
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

    const data:DifyFileResponse = await response.json();
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
