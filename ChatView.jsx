const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Coins, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { suggestions, ANON_MESSAGE_LIMIT } from "@/lib/mockAi";
import { useAuth } from "@/lib/AuthContext";

import { MessageBubble } from "./MessageBubble";
import { ChatComposer } from "./ChatComposer";
import { TypingIndicator } from "./TypingIndicator";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatView() {
  const { user, isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [credits, setCredits] = useState(user?.credits ?? 0);
  const scrollRef = useRef(null);

  const isAuthed = isAuthenticated;
  const anonMessageCount = messages.filter((m) => m.role === "user").length;
  const anonLimitReached = !isAuthed && anonMessageCount >= ANON_MESSAGE_LIMIT;
  const outOfCredits = isAuthed && credits <= 0;
  const hasMessages = messages.length > 0;

  useEffect(() => {
    setCredits(user?.credits ?? 0);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, thinking]);

  async function handleSend(text) {
    if (anonLimitReached || outOfCredits || thinking) return;

    const userMessage = { id: uid(), role: "user", content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);

    const startedAt = Date.now();
    let answer;
    try {
      const res = await db.functions.invoke("chatWithAi", {
        message: text,
        history,
        user_id: user?.id || null,
      });
      answer = res.data?.reply ?? "Sorry, I couldn't get a response from the AI.";
    } catch (e) {
      answer = "Sorry, something went wrong reaching the AI. Please try again.";
    }
    const thinkMs = Date.now() - startedAt;

    let creditsUsed;
    if (isAuthed) {
      creditsUsed = thinkMs / 1000;
      const newCredits = Math.max(0, Math.round((credits - creditsUsed) * 100) / 100);
      setCredits(newCredits);
      try {
        await db.auth.updateMe({ credits: newCredits });
      } catch (e) {

        // best-effort persist
      }}

    setMessages((prev) => [
    ...prev,
    {
      id: uid(),
      role: "assistant",
      content: answer,
      thinkingMs: thinkMs,
      creditsUsed
    }]
    );
    setThinking(false);
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col px-4">
      <header className="flex items-center justify-between gap-3 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Iris</p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              AI Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthed &&
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              <Coins className="size-3" />
              {credits.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          }
          {isAuthed ?
          <>
              <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dashboard">
              
                <LayoutDashboard className="size-4" />
              </Link>
              <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sign out">
              
                <LogOut className="size-4" />
              </button>
            </> :

          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Sign in">
            
              <LogIn className="size-4" />
            </Link>
          }
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-6 overflow-y-auto scroll-smooth py-4">
        
        {!hasMessages &&
        <div className="flex h-full flex-col items-center justify-center gap-8 text-center animate-fade-in">
            <div className="relative flex size-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/25 blur-2xl animate-blob" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Sparkles className="size-7" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold">
                How can I help you today?
              </h1>
              <p className="text-pretty text-sm text-muted-foreground">
                {isAuthed ?
              "Ask me anything — your thinking time is billed in credits." :
              `Ask me anything. Guests get ${ANON_MESSAGE_LIMIT} free messages — sign in for more.`}
              </p>
            </div>
            <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((s, i) =>
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              style={{ animationDelay: `${i * 0.07}s` }}
              className="animate-fade-up rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left text-sm text-card-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
              
                  {s}
                </button>
            )}
            </div>
          </div>
        }

        {messages.map((m) =>
        <MessageBubble key={m.id} message={m} />
        )}

        {thinking &&
        <div className="flex items-end gap-3 animate-fade-up">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-border/60">
              <Sparkles className="size-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card px-4 py-3 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        }
      </div>

      {(anonLimitReached || outOfCredits) &&
      <div className="mb-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-center text-sm text-muted-foreground backdrop-blur">
          {anonLimitReached ?
        <>
              You've used all {ANON_MESSAGE_LIMIT} free messages.{" "}
              <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>{" "}
              for more.
            </> :

        <>
              You're out of credits. Visit the{" "}
              <Link to="/dashboard" className="font-medium text-foreground underline-offset-4 hover:underline">
                dashboard
              </Link>{" "}
              to manage your account.
            </>
        }
        </div>
      }

      <div className="pb-4">
        <ChatComposer onSend={handleSend} disabled={thinking || anonLimitReached || outOfCredits} />
      </div>
    </div>);

}