export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, history, user_id } = req.body;[cite: 1]

    const aiUrl = process.env.IRIS_AI_URL;[cite: 1]
    const apiKey = process.env.IRIS_AI_API_KEY;[cite: 1]

    if (!aiUrl || !apiKey) {
      return res.status(500).json({ error: "Server environment variables are not configured." });[cite: 1]
    }

    // Secure server-to-server request to your AI backend / Cloudflare tunnel
    const apiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message, history, user_id }),[cite: 1]
    });

    if (!apiRes.ok) {
      return res.status(500).json({ error: `AI endpoint returned status ${apiRes.status}` });[cite: 1]
    }

    const data = await apiRes.json();[cite: 1]
    return res.status(200).json(data);[cite: 1]

  } catch (error) {
    return res.status(500).json({ error: error.message });[cite: 1]
  }
}