import { useRef, useState } from "react";
import { ArrowUp, Plus, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"];
const CODE_EXTENSIONS = [
  ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".c", ".cpp", ".h", ".hpp",
  ".cs", ".go", ".rb", ".php", ".html", ".css", ".json", ".yaml", ".yml",
  ".md", ".txt", ".sql", ".sh", ".ps1", ".rs", ".swift", ".kt", ".xml",
];
const ACCEPTED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...CODE_EXTENSIONS];
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");

function isImageFile(file) {
  const name = file.name.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export function ChatComposer({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleFileSelect(e) {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => {
      const name = f.name.toLowerCase();
      return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    });
    setFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || disabled) return;

    const attachments = await Promise.all(
      files.map(async (file) => {
        if (isImageFile(file)) {
          const dataUrl = await readFileAsDataURL(file);
          return { name: file.name, type: "image", size: file.size, dataUrl, file };
        }
        const content = await readFileAsText(file);
        return { name: file.name, type: "code", size: file.size, content };
      })
    );

    onSend(trimmed, attachments);
    setValue("");
    setFiles([]);
    requestAnimationFrame(resize);
  }

  function handleKeyDown(e) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = (value.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="rounded-3xl border border-border/70 bg-card/80 p-2 shadow-lg shadow-primary/5 backdrop-blur-xl transition-colors focus-within:border-primary/50">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 pb-1 pt-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-1.5"
            >
              {isImageFile(file) ? (
                <ImageIcon className="size-4 shrink-0 text-primary" />
              ) : (
                <FileText className="size-4 shrink-0 text-primary" />
              )}
              <span className="max-w-[120px] truncate text-xs font-medium text-foreground">
                {file.name}
              </span>
              <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-0.5 shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach files"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
            disabled
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95"
          )}
        >
          <Plus className="size-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={handleFileSelect}
          className="hidden"
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message Jude…"
          aria-label="Message input"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[0.95rem] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
            canSend
              ? "bg-primary text-primary-foreground shadow-md hover:scale-105 hover:brightness-105 active:scale-95"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
    </div>
  );
}
