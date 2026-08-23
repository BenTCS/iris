import ReactMarkdown from "react-markdown";
import { Sparkles, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 animate-fade-up",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-border/60",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </div>

      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/60 bg-card text-card-foreground",
        )}
      >
        <span className="sr-only">
          {isUser ? "You said: " : "Assistant said: "}
        </span>
        {isUser ? (
          message.content
        ) : (
          <div className="prose-chat">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="m-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[0.85em]">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-background/60 p-3 font-mono text-xs">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="ml-4 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="ml-4 list-decimal space-y-1">{children}</ol>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att, i) =>
              att.type === "image" ? (
                <img
                  key={i}
                  src={att.dataUrl}
                  alt={att.name}
                  className="max-h-32 max-w-full rounded-lg object-cover"
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-foreground/10 px-2.5 py-1.5"
                >
                  <FileText className="size-3.5 shrink-0 text-primary-foreground/80" />
                  <span className="text-xs font-medium text-primary-foreground/90">
                    {att.name}
                  </span>
                </div>
              )
            )}
          </div>
        )}
        {!isUser && message.thinkingMs != null && (
          <div className="mt-2 flex items-center gap-2 border-t border-border/40 pt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            <span>
              {message.thinkingMs < 1000
                ? `${message.thinkingMs}ms`
                : `${(message.thinkingMs / 1000).toFixed(1)}s`}{" "}
              thinking
            </span>
            {message.creditsUsed != null && (
              <>
                <span className="text-border">·</span>
                <span>{message.creditsUsed} credits</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}