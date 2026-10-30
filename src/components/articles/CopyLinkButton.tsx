"use client";

import { useEffect, useState } from "react";
import { LinkIcon } from "@/components/ui/icons";

/** Tiempo que se muestra el aviso de enlace copiado. */
const COPIED_MS = 2000;

interface CopyLinkButtonProps {
  url: string;
  label: string;
  copiedLabel: string;
}

export function CopyLinkButton({ url, label, copiedLabel }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Sin permiso del navegador no hay nada que hacer; el botón queda como estaba.
    }
  }

  return (
    <button type="button" onClick={copy} aria-label={copied ? copiedLabel : label} className="hover:text-accent">
      <LinkIcon className="size-5" />
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
