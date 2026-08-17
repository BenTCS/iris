import { secrets } from "base44:runtime";

const DEFAULT_CLOUDFLARE_AI_URL =
  "https://engage-allan-resolutions-yours.trycloudflare.com/chat";

export default async function (req) {
  try {
    let aiUrl = DEFAULT_CLOUDFLARE_AI_URL;
    try {
      const override = secrets.get("IRIS_AI_URL");
      if (override) aiUrl = override;
    } catch {}
    const apiKey = secrets.get("IRIS_AI_API_KEY");
    const body = await req.json().catch(() => ({}));
    const message = body?.message;
    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const apiRes = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!apiRes.ok) {
      return Response.json(
        { error: `AI endpoint returned ${apiRes.status}` },
        { status: 502 }
      );
    }

    const data = await apiRes.json().catch(() => ({}));
    const reply = (data?.answer ?? "").toString().trim();
    if (!reply) {
      return Response.json(
        { error: "AI endpoint did not return an answer" },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}