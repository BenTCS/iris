import AmbientBackground from "@/components/AmbientBackground";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <AmbientBackground />

      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex size-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/25 blur-2xl animate-blob" />
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Icon className="size-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl">
          {children}
        </div>

        {footer && (
          <p className="mt-5 text-center text-xs text-muted-foreground">{footer}</p>
        )}
      </div>
    </main>
  );
}