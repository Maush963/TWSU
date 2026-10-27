import { uiText } from "@/content/ui-text";

export function Footer() {
  return (
    <footer className="p-4 text-sm text-muted">
      <p>{uiText.footer.rights}</p>
    </footer>
  );
}
