export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, history } = req.body;

    const aiUrl = process.env.IRIS_AI_URL;
    const apiKey = process.env.IRIS_AI_API_KEY;

    if (!aiUrl || !apiKey) {
      return res.status(500).json({ error: "Server environment variables are not configured." });
    }

    // Make the secure server-to-server call to your AI backend
    const apiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message, history }),
    });

    if (!apiRes.ok) {
      return res.status(500).json({ error: `AI endpoint returned status ${apiRes.status}` });
    }

    const data = await apiRes.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}