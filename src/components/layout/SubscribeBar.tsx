"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { uiText } from "@/content/ui-text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Status = "idle" | "sending" | "success" | "error";

export function SubscribeBar() {
  const [status, setStatus] = useState<Status>("idle");
  // Momento en que se mostró el formulario, para detectar envíos demasiado rápidos.
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          website: data.get("website"),
          startedAt: startedAt.current,
        }),
      });
      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="subscribe-title" className="flex flex-col gap-2 px-8 py-4">
      <h2 id="subscribe-title" className="font-display text-lg uppercase tracking-caps text-accent">
        {uiText.subscribe.title}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <label htmlFor="subscribe-email" className="sr-only">
          {uiText.subscribe.emailLabel}
        </label>
        <Input
          id="subscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={uiText.subscribe.emailPlaceholder}
        />
        {/* Campo trampa: las personas no lo ven ni lo llenan. */}
        <div aria-hidden="true" className="absolute left-0 top-0 h-0 w-0 overflow-hidden opacity-0">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? uiText.subscribe.sending : uiText.subscribe.submit}
        </Button>
      </form>
      <p role="status" className="text-sm">
        {status === "success" && uiText.subscribe.success}
        {status === "error" && uiText.subscribe.error}
      </p>
    </section>
  );
}
