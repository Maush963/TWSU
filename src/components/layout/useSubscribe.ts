"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export type SubscribeStatus = "idle" | "sending" | "success" | "error";

// Lógica compartida de los formularios de suscripción (pie de página y bloque de la Home).
export function useSubscribe() {
  const [status, setStatus] = useState<SubscribeStatus>("idle");
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

  return { status, onSubmit };
}
