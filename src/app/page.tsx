import type { Metadata } from "next";
import { uiText } from "@/content/ui-text";

export const metadata: Metadata = { title: uiText.home.title };

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.home.title}</h1>
      <p className="text-muted">{uiText.common.placeholderContent}</p>
    </main>
  );
}
