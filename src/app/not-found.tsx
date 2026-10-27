import Link from "next/link";
import { uiText } from "@/content/ui-text";

export default function NotFound() {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.notFound.title}</h1>
      <p className="text-muted">{uiText.notFound.description}</p>
      <Link href="/" className="text-accent">
        {uiText.notFound.back}
      </Link>
    </main>
  );
}
