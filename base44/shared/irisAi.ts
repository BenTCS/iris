import { secrets } from "base44:runtime";

const DEFAULT_CLOUDFLARE_AI_URL =
  "https://engage-allan-resolutions-yours.trycloudflare.com/chat";

/**
 * Shared Iris AI call — supports message history for conversational memory.
 * @param {string} message - The current user message
 * @param {Array} history - Optional array of past messages: [{role: 'user'|'assistant', content: '...'}]
 * @param {string} userId - Optional user ID
 */
export async function callIrisAi(message, history = [], userId = null) {
  let aiUrl = DEFAULT_CLOUDFLARE_AI_URL;
  try {
    const override = secrets.get("IRIS_AI_URL");
    if (override) aiUrl = override;
  } catch {}
  const apiKey = secrets.get("IRIS_AI_API_KEY");

  const requestBody = {
    message,
    history,
  };

  if (userId) {
    requestBody.user_id = userId;
  }

  const apiRes = await fetch(aiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!apiRes.ok) {
    throw new Error(`AI endpoint returned ${apiRes.status}`);
  }

  const data = await apiRes.json().catch(() => ({}));
  const reply = (data?.answer ?? "").toString().trim();
  if (!reply) {
    throw new Error("AI endpoint did not return an answer");
  }
  return reply;
}