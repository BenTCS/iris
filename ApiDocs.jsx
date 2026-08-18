const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link } from "react-router-dom";
import { ArrowLeft, Key, Terminal, BookOpen, Code2, History, User } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";

function CodeBlock({ children, label }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/80">
      {label && (
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2">
          <Terminal className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/90">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function ApiDocs() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <header className="mb-8">
          <Link
            to="/dashboard"
            className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">API Documentation</h1>
              <p className="text-sm text-muted-foreground">
                Use your API key to chat with the assistant from any application.
              </p>
            </div>
          </div>
        </header>

        {/* Getting started */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Key className="size-4" />
            Getting started
          </h2>
          <ol className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[0.65rem] font-semibold text-primary">1</span>
              <span>
                Create an API key on the{" "}
                <Link to="/dashboard" className="font-medium text-foreground underline-offset-4 hover:underline">
                  dashboard
                </Link>
                . You don't need to be logged in — anyone can generate a key.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[0.65rem] font-semibold text-primary">2</span>
              <span>Copy the key immediately — it's only shown once.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[0.65rem] font-semibold text-primary">3</span>
              <span>
                Send a <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">POST</code> request to the chat endpoint with your key in the <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">Authorization</code> header.
              </span>
            </li>
          </ol>
        </section>

        {/* Endpoint */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold">Endpoint</h2>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-primary">POST</span>
            <code className="flex-1 overflow-x-auto font-mono text-xs text-foreground/90">
              https://api.db.com/apps/&lt;your-app-id&gt;/functions/apiChat
            </code>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Find your exact function URL in the Base44 builder under your app's backend functions.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold">Authentication</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Pass your API key as a Bearer token in the <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">Authorization</code> header.
            You can also send it in the request body as <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">api_key</code>.
          </p>
          <CodeBlock label="Header">Authorization: Bearer vd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
        </section>

        {/* Request body */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold">Request body</h2>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs font-medium text-foreground">message</code>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-primary">string</span>
                <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-destructive">required</span>
              </div>
              <p className="text-xs text-muted-foreground">The user's message to the assistant.</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs font-medium text-foreground">history</code>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-primary">array</span>
                <span className="rounded-md bg-muted/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground">optional</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Past conversation turns for memory:{" "}
                <code className="font-mono text-[0.7rem]">[{"{ role, content }"}]</code>. Roles are{" "}
                <code className="font-mono text-[0.7rem]">"user"</code> and{" "}
                <code className="font-mono text-[0.7rem]">"assistant"</code>.
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs font-medium text-foreground">user_id</code>
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-primary">string</span>
                <span className="rounded-md bg-muted/40 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground">optional</span>
              </div>
              <p className="text-xs text-muted-foreground">A user identifier to associate the conversation with a specific user.</p>
            </div>
          </div>
        </section>

        {/* Response */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold">Response</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Returns JSON with the assistant's reply:
          </p>
          <CodeBlock label="200 OK">{`{
  "reply": "The assistant's response text",
  "key": "Production"
}`}</CodeBlock>
          <p className="mt-3 mb-2 text-sm text-muted-foreground">Error responses:</p>
          <CodeBlock label="401 Unauthorized">{`{ "error": "API key required ..." }`}</CodeBlock>
          <CodeBlock label="400 Bad Request">{`{ "error": "message is required" }`}</CodeBlock>
        </section>

        {/* Examples */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Code2 className="size-4" />
            Code examples
          </h2>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">cURL</p>
              <CodeBlock label="bash">{`curl -X POST https://api.db.com/apps/<your-app-id>/functions/apiChat \\
  -H "Authorization: Bearer vd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, who are you?",
    "history": [],
    "user_id": "user-123"
  }'`}</CodeBlock>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Python</p>
              <CodeBlock label="python">{`import requests

resp = requests.post(
    "https://api.db.com/apps/<your-app-id>/functions/apiChat",
    headers={
        "Authorization": "Bearer vd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Content-Type": "application/json",
    },
    json={
        "message": "Hello, who are you?",
        "history": [],
        "user_id": "user-123",
    },
)

data = resp.json()
print(data["reply"])`}</CodeBlock>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">JavaScript</p>
              <CodeBlock label="javascript">{`const res = await fetch(
  "https://api.db.com/apps/<your-app-id>/functions/apiChat",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer vd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Hello, who are you?",
      history: [],
      user_id: "user-123",
    }),
  }
);

const data = await res.json();
console.log(data.reply);`}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Conversation memory */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <History className="size-4" />
            Conversation memory
          </h2>
          <p className="text-sm text-muted-foreground">
            To give the assistant memory of past turns, pass the accumulated conversation in{" "}
            <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">history</code>.
            Each entry has a <code className="font-mono text-xs">role</code> ("user" or "assistant")
            and <code className="font-mono text-xs">content</code>. The assistant uses this context to
            recall what was said earlier in the conversation.
          </p>
          <div className="mt-3">
            <CodeBlock label="history example">{`[
  { "role": "user", "content": "Say something random." },
  { "role": "assistant", "content": "Did you know the shortest war lasted 38 minutes?" },
  { "role": "user", "content": "What did you just say?" }
]`}</CodeBlock>
          </div>
        </section>

        {/* User ID */}
        <section className="mb-8 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <User className="size-4" />
            User identification
          </h2>
          <p className="text-sm text-muted-foreground">
            Pass a <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">user_id</code>{" "}
            to associate requests with a specific user. This is optional but useful for per-user
            context and tracking. API keys work without logging in to the app — authentication is
            handled entirely by your API key.
          </p>
        </section>
      </div>
    </main>
  );
}