/**
 * Shared Iris AI call — supports message history for conversational memory.
 * @param {string} message - The current user message
 * @param {Array} history - Optional array of past messages: [{role: 'user'|'assistant', content: '...'}]
 * @param {string} userId - Optional user ID
 */
export async function callIrisAi(message, history = [], userId = null) {
  const requestBody = {
    message,
    history,
  };

  if (userId) {
    requestBody.user_id = userId;
  }

  // Call your secure Vercel serverless function endpoint
  const apiRes = await fetch('/api/chat', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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