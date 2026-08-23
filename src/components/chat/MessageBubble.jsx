import { Sparkles, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function formatContent(content) {
  if (!content) return content;
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

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
        {isUser ? message.content : <div className="space-y-0.5">{formatContent(message.content)}</div>}
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
