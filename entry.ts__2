import { callIrisAi } from "../../shared/irisAi.ts";

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message;
    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }
    const userId = body?.user_id ? String(body.user_id) : null;
    const history = Array.isArray(body?.history) ? body.history : [];
    const reply = await callIrisAi(message, history, userId);
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}