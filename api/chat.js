module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, history, user_id } = req.body;

    const aiUrl = process.env.IRIS_AI_URL;
    const apiKey = process.env.IRIS_AI_API_KEY;

    if (!aiUrl || !apiKey) {
      console.error("Missing environment variables: IRIS_AI_URL or IRIS_AI_API_KEY");
      return res.status(500).json({ error: "Server environment variables are not configured." });
    }

    const apiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message, history, user_id }),
    });

    const responseText = await apiRes.text();

    if (!apiRes.ok) {
      console.error(`AI endpoint error (${apiRes.status}):`, responseText);
      return res.status(500).json({ error: `AI endpoint returned status ${apiRes.status}: ${responseText}` });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json(data);

  } catch (error) {
    console.error("Catch block error in Chat.js:", error.message);
    return res.status(500).json({ error: error.message });
  }
};