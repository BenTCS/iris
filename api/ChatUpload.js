export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), { status: 405 });
  }

  try {
    const aiUrl = process.env.IRIS_AI_UPLOAD_URL; // your tunnel URL + /chat/upload
    const apiKey = process.env.IRIS_AI_API_KEY;

    if (!aiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: "Server environment variables are not configured." }), { status: 500 });
    }

    const incoming = await req.formData();
    const file = incoming.get('file');
    const message = incoming.get('message') || '';
    const user_id = incoming.get('user_id') || '';

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided." }), { status: 400 });
    }

    const forward = new FormData();
    forward.append('file', file, file.name);
    forward.append('message', message);
    forward.append('user_id', user_id);

    const apiRes = await fetch(aiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` }, // no Content-Type — fetch sets the multipart boundary itself
      body: forward,
    });

    const responseText = await apiRes.text();
    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: `AI endpoint returned status ${apiRes.status}: ${responseText}` }), { status: 500 });
    }

    return new Response(responseText, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
