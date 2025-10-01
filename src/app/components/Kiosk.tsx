"use client";
import { useState, useRef } from "react";
import styles from "./Kiosk.module.css";

const MAX_IMAGE_MB = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_MB || 10);

export default function Kiosk() {
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [post, setPost] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false); // kontroluje które guziki widać
  const [fullPost, setFullPost] = useState(""); // pełny tekst do maila
  const typingTimerRef = useRef<number | null>(null); // do zatrzymania „maszynopisu”
  const [isTyping, setIsTyping] = useState(false); // animacja w toku

  const onFile = (f?: File) => {
    if (!f) return;
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_IMAGE_MB) {
      alert(`Plik jest większy niż ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setImageFile(f);
  };

  async function handleGenerate() {
    try {
      setLoading(true);
      setHasGenerated(true); // po kliknięciu chowamy „Generate”, pokażemy pozostałe
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Błąd generowania");

      const text = String(data.post || "");
      setFullPost(text); // pełen tekst do wysyłki
      typeText(text, 12); // maszynopis (12ms/znak ≈ 80–90 znaków/s)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function fileToBase64(
    file: File
  ): Promise<{ base64: string; name: string; type: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string; // data:<mime>;base64,<data>
        const commaIdx = result.indexOf(",");
        const base64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
        resolve({
          base64,
          name: file.name,
          type: file.type || "application/octet-stream",
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSend() {
    if (!email) return alert("Podaj adres e-mail");
    if (!post) return alert("Najpierw wygeneruj treść posta");

    try {
      setLoading(true);

      // 1) Upsert kontakt w HubSpot
      await fetch("/api/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // 2) Wyślij maila z Resend (załącznik opcjonalny)
      let attachmentBase64: string | null = null;
      let attachmentName = "";
      let attachmentType = "";
      if (imageFile) {
        const { base64, name, type } = await fileToBase64(imageFile);
        attachmentBase64 = base64;
        attachmentName = name;
        attachmentType = type;
      }

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          post: fullPost || post, // na wszelki wypadek
          attachmentBase64,
          attachmentName,
          attachmentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Błąd wysyłki wiadomości");
      alert("Wysłano e-mail!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setEmail("");
    setPrompt("");
    setPost("");
    setFullPost("");
    setImageFile(null);
    setHasGenerated(false);

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function typeText(text: string, speedMs = 12) {
    // przerwij ewentualne poprzednie „stukanie”
    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(true);
    setPost("");
    let i = 0;
    typingTimerRef.current = window.setInterval(() => {
      i++;
      setPost(text.slice(0, i));
      if (i >= text.length) {
        if (typingTimerRef.current)
          window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setIsTyping(false);
      }
    }, speedMs);
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Kiosk LinkedIn Generator</h1>

      <div className={styles.formGrid}>
        <label className={styles.labelBlock}>
          <span className={styles.label}>E-mail uczestnika</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="anna.kowalska@example.com"
          />
        </label>

        <label className={styles.labelBlock}>
          <span className={styles.label}>Zdjęcie (opcjonalnie)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] || undefined)}
            className={styles.input}
          />
          {imageFile && (
            <p className={styles.hint}>Wybrano: {imageFile.name}</p>
          )}
        </label>

        <label className={styles.labelBlock}>
          <span className={styles.label}>
            Prompt (słowa kluczowe, atmosfera, kontekst)
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={`${styles.input} ${styles.textarea}`}
            placeholder="np. AI na wydarzeniach, networking, entuzjastyczny ton, CTA do polubienia"
          />
        </label>

        <div className={styles.buttons}>
          {!hasGenerated && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`${styles.primary} ${styles.fadeIn}`}
            >
              Generate
            </button>
          )}

          {hasGenerated && (
            <div className={styles.fadeIn} aria-hidden={false}>
              <button
                onClick={handleGenerate}
                disabled={loading || isTyping}
                className={styles.secondary}
                title={isTyping ? "Poczekaj aż skończy pisać" : undefined}
              >
                Generate again
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !fullPost}
                className={styles.success}
              >
                Wyślij
              </button>
              <button onClick={handleClear} className={styles.secondary}>
                Wyczyść
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <span className={styles.label}>Wygenerowany post:</span>
        <div
          className={`${styles.input} ${styles.textareaLarge}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          <span className={isTyping ? styles.caret : undefined}>{post}</span>
        </div>
      </div>
    </div>
  );
}
