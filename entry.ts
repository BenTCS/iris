const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { waitUntil } from "base44:runtime";
import { callIrisAi } from "../../shared/irisAi.ts";

/**
 * Public, API-key-authenticated chat endpoint.
 *
 * Usage from any external app:
 *   POST <function-url>
 *   Authorization: Bearer vd_live_...
 *   Content-Type: application/json
 *   { "message": "Hello" }
 *
 * Returns: { "reply": "...", "key": "<key name>" }
 */
export default async function (req) {
  try {
    // Accept the key from the Authorization header (preferred) or body.api_key
    const authHeader = req.headers.get("Authorization") || "";
    // Only treat the Authorization header as an API key when it carries a
    // vd_live_ key; otherwise it's the platform's own user token and we fall
    // back to body.api_key.
    let apiKey = "";
    if (authHeader.startsWith("Bearer vd_live_")) {
      apiKey = authHeader.slice(7).trim();
    }
    const body = await req.json().catch(() => ({}));
    if (!apiKey) {
      apiKey = (body?.api_key ?? "").toString();
    }
    const message = (body?.message ?? "").toString();

    if (!apiKey) {
      return Response.json(
        { error: "API key required (Authorization: Bearer <key> or body.api_key)" },
        { status: 401 }
      );
    }
    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    // No user auth on this endpoint — look up the key with the service role.
    const matches = await db.asServiceRole.entities.ApiKey.filter({
      key_value: apiKey,
    });
    if (!matches || matches.length === 0) {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }
    const keyRecord = matches[0];

    const reply = await callIrisAi(message);

    // Stamp last_used_at after the response is sent.
    waitUntil(
      db.asServiceRole.entities.ApiKey
        .update(keyRecord.id, { last_used_at: new Date().toISOString() })
        .catch(() => {})
    );

    return Response.json({ reply, key: keyRecord.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}