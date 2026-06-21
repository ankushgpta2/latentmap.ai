"use client";

import { useState, useRef, useEffect } from "react";

export function LoginForm({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        window.location.assign(next);
        return;
      }
      setError(
        data.error ?? "That code didn't work. Check it and try again."
      );
      setSubmitting(false);
    } catch {
      setError("Network error. Try again in a moment.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-describedby={error ? "login-error" : undefined}>
      <label className="block">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] block mb-2">
          Invite code
        </span>
        <input
          ref={inputRef}
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={256}
          disabled={submitting}
          required
          className="w-full bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-border)] rounded-md px-4 py-3 text-[16px] text-[var(--color-fg)] mono tracking-wider placeholder-[color:var(--color-fg-subtle)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/30 disabled:opacity-60"
          placeholder="••••••••"
        />
      </label>

      {error ? (
        <p
          id="login-error"
          role="alert"
          className="text-[13px] text-[var(--color-danger)] border-l-2 border-[var(--color-danger)] pl-3 py-1"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || code.length === 0}
        className="w-full mono text-[11px] uppercase tracking-[0.14em] px-5 py-3 border border-[color:var(--color-fg)] text-[var(--color-fg)] rounded-md transition-all hover:bg-[color:var(--color-fg)] hover:text-[var(--color-bg)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-fg)]"
      >
        {submitting ? "Verifying…" : "Continue →"}
      </button>
    </form>
  );
}
