"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Kopieren fehlgeschlagen");
    }
  };

  return (
    <button
      className={`lj-btn lj-btn-outline lj-btn-fixed ${
        copied ? "lj-copied" : ""
      }`}
      onClick={handleClick}
    >
      {/* zamiast zmieniać liczbę znaków – wymieniamy tylko treść */}
      {copied ? "Kopiert ✓" : "Link kopieren"}
    </button>
  );
}
