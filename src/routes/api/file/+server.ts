// src/routes/api/file/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { DifyFileResponse } from "../../../types/types";
export const POST: RequestHandler = async ({ request }) => {
  const secretKey = env.PUBLIC_VITE_DIFY_API_KEY;
  
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const user = formData.get("user");

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "File is required" }), {
        status: 400,
      });
    }

    // Define allowed document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv'
    ];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: "Unsupported file type", 
        details: `Only document files are accepted. Allowed types: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV`
      }), { 
        status: 415 
      });
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("user", user as string);

    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const response = await fetch("https://api.dify.ai/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Dify API Error Response:', errorData);
      return new Response(JSON.stringify({ 
        error: "Failed to upload to Dify API", 
        details: errorData.message || 'Unknown error',
        code: errorData.code
      }), { 
        status: response.status 
      });
    }

    const data: DifyFileResponse = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: "Request failed", details: error.message }), 
      { status: 500 }
    );
  }
};