import type { Metadata } from "next";
import { uiText } from "@/content/ui-text";

export const metadata: Metadata = { title: uiText.about.title };

export default function AboutPage() {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.about.title}</h1>
      <p className="text-muted">{uiText.common.placeholderContent}</p>
    </main>
  );
}
