export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, history, user_id } = req.body;[cite: 1]

    const aiUrl = process.env.IRIS_AI_URL;[cite: 1]
    const apiKey = process.env.IRIS_AI_API_KEY;[cite: 1]

    if (!aiUrl || !apiKey) {
      console.error("Missing environment variables: IRIS_AI_URL or IRIS_AI_API_KEY");
      return res.status(500).json({ error: "Server environment variables are not configured." });[cite: 1]
    }

    const apiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message, history, user_id }),[cite: 1]
    });

    // Read the text response first to see what the backend actually returned
    const responseText = await apiRes.text();

    if (!apiRes.ok) {
      console.error(`AI endpoint error (${apiRes.status}):`, responseText);
      return res.status(500).json({ error: `AI endpoint returned status ${apiRes.status}: ${responseText}` });[cite: 1]
    }

    // Parse the text back to JSON if it succeeded
    const data = JSON.parse(responseText);
    return res.status(200).json(data);[cite: 1]

  } catch (error) {
    console.error("Catch block error in Chat.js:", error.message);
    return res.status(500).json({ error: error.message });[cite: 1]
  }
}