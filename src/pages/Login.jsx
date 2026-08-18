const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Sparkles, Loader as Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

function GoogleIconBadge() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const returnTo = safeReturnTo();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await db.auth.loginViaEmailPassword(email, password);
        window.location.href = returnTo;
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await db.auth.register({ email, password });
        setShowOtp(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setError(null);
    setBusy(true);
    try {
      const result = await db.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        db.auth.setToken(result.access_token);
      }
      window.location.href = returnTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await db.auth.resendOtp(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    }
  }

  function handleGoogle() {
    db.auth.loginWithProvider("google", returnTo);
  }

  if (showOtp) {
    return (
      <AuthLayout
        icon={Sparkles}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="mb-5 flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <button
          type="button"
          onClick={handleVerify}
          disabled={busy || otpCode.length < 6}
          className="h-10 w-full gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-all hover:brightness-105 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Sparkles}
      title="Verdant"
      subtitle="AI Assistant"
      footer={
        mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </>
        )
      }
    >
      <div className="mb-5 flex rounded-xl bg-muted/60 p-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
          className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition-all ${
            mode === "signin"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition-all ${
            mode === "signup"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="At least 6 characters"
          />
        </div>
        {mode === "signup" && (
          <div>
            <label
              htmlFor="confirm"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Re-enter your password"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-10 w-full gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-all hover:brightness-105 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {mode === "signin" && (
        <p className="mt-3 text-right">
          <Link
            to="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      )}

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium transition-all hover:bg-muted disabled:opacity-50"
      >
        <GoogleIconBadge />
        Continue with Google
      </button>
    </AuthLayout>
  );
}