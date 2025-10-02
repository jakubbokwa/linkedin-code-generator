"use client";
export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="lj-btn lj-btn-outline lj-copy"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      TEXT KOPIEREN
    </button>
  );
}
