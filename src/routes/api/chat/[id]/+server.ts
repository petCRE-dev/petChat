import type { RequestHandler } from "@sveltejs/kit";

//Mockdata
const chats = [
  { id: "1", message: "Hello" },
  { id: "2", message: "Hi there" },
  { id: "3", message: "Greetings" },
];
export const GET: RequestHandler = ({ params }) => {
  const chat = chats.find((c) => c.id === params.id);
  if (!chat) {
    return new Response(JSON.stringify({ error: "Chat not found" }), {
      status: 404,
    });
  }
  return new Response(JSON.stringify(chat), {
    headers: { "Content-Type": "application/json" },
  });
};
