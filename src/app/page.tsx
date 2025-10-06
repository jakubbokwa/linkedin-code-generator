/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import QRCode from "qrcode";
import { BASE_PROMPT_DE, OPTION_TAGS } from "@/lib/constants";
import CopyButton from "../app/components/CopyButton";
import ProgressBar from "./components/ProgressBar";

export default function Home() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // QR
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // PROGRESS
  const [maxProgress, setMaxProgress] = useState(0);
  const updateProgress = (value: number) => {
    setMaxProgress((prev) => (value > prev ? value : prev));
  };

  // 1️⃣ Dodanie zdjęcia
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      updateProgress(20);
    };
    reader.readAsDataURL(f);
  };

  // 2️⃣ Zaznaczenie akcentów
  const toggleOpt = (opt: string) => {
    setSelected((prev) => {
      const newSelected = prev.includes(opt)
        ? prev.filter((o) => o !== opt)
        : [...prev, opt];
      if (newSelected.length > 0) updateProgress(40);
      return newSelected;
    });
  };

  // 3️⃣ Kliknięcie „Generieren”
  const generate = async () => {
    setLoading(true);
    setPicked(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrompt: BASE_PROMPT_DE,
          selected,
          photoDataUrl,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Fehler");
      setVariants(json.variants);
      setQrLink(null);
      setQrDataUrl(null);
      updateProgress(60);
    } catch (e: any) {
      alert(e.message ?? "Fehler bei der Generierung");
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ Wybór wariantu
  const handleVariantSelect = (i: number) => {
    setPicked((prev) => (prev === i ? null : i));
    updateProgress(80);
  };

  // 5️⃣ Podanie e-maila / Fertig
  const ready = async () => {
    if (picked === null) return alert("Bitte eine Variante auswählen.");
    if (!email) return alert("Bitte E-Mail eingeben.");

    updateProgress(100);
    setQrLoading(true);
    setQrLink(null);
    setQrDataUrl(null);

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          chosenPost: variants[picked],
          basePrompt: BASE_PROMPT_DE,
          photoDataUrl,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Fehler");

      // mamy link do strony wynikowej — generujemy QR
      setQrLink(json.link);
      const dataUrl = await QRCode.toDataURL(json.link, {
        width: 320,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFFFF" },
      });
      setQrDataUrl(dataUrl);
    } catch (e: any) {
      alert(e.message ?? "Konnte Link nicht erzeugen");
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <>
      <ProgressBar value={maxProgress} />
      <main className="lj-container">
        <h1 className="lj-h1">
          WIR VERSTEHEN B2B<span className="lj-slash">/</span>
        </h1>
        <p className="lj-paragraph">
          Genau deshalb haben wir uns vorsorglich schon mal um Ihren
          obligatorischen LinkedIn-Post zu den B2B Communication Days 2025
          gekümmert.
          <br />
          <br />
          Nutzen Sie gerne unseren Postingtext-Generator und unsere Fotowall.
        </p>

        {/* 1) Foto */}
        <section className="lj-section">
          <label className="lj-label">Foto anhängen (optional)</label>
          <input
            className="lj-input lj-file"
            type="file"
            accept="image/*"
            onChange={onPickFile}
          />
          {photoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoDataUrl}
              alt="Vorschau"
              className="lj-img"
              style={{ marginTop: 12, maxWidth: "100%" }}
            />
          )}
        </section>

        {/* 2) Basis-Prompt – jak akapit (bez ramki) */}
        <section className="lj-section">
          <label className="lj-label">Hier unser Basis-Text:</label>
          <textarea
            className="lj-textarea lj-readonly lj-plainpara"
            readOnly
            value={BASE_PROMPT_DE}
            rows={4}
          />
        </section>

        {/* 3) Checkboxy akcentów */}
        <section className="lj-section">
          <label className="lj-label">
            Hier haben Sie die Möglichkeit, Ihrem Text noch eine persönliche
            Note zu geben, indem sie angeben, was Sie besonders fasziniert hat
            (Mehrfachnennung möglich):
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 10,
            }}
          >
            {OPTION_TAGS.map((opt) => (
              <label
                key={opt}
                className="lj-card lj-check-row"
                style={{ padding: 10, paddingLeft: 0, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  className="lj-check"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOpt(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 4) Generieren */}
        <div className="lj-section">
          <button className="lj-btn" onClick={generate} disabled={loading}>
            {variants.length
              ? loading
                ? "Generiere…"
                : "mehr Varianten"
              : loading
              ? "Generiere…"
              : "Pers. Text generieren"}
          </button>
        </div>

        {/* 5) Warianty A/B/C */}
        {variants.length > 0 && (
          <section className="lj-section">
            <p className="lj-label" style={{ marginBottom: 8 }}>
              Wählen SIe Ihren Favoriten-Text aus, um Ihn für Ihren LinkedIn-Post
              zu verwenden:
            </p>
            {[0, 1, 2].map((i) => (
              <label
                key={i}
                className="lj-variant lj-check-row"
                style={{ alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  className="lj-check"
                  checked={picked === i}
                  onChange={() => handleVariantSelect(i)}
                />
                <div>
                  <div className="lj-variant-title">
                    Variante {["A", "B", "C"][i]}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{variants[i]}</div>
                </div>
              </label>
            ))}
          </section>
        )}

        {/* 6) E-mail + Fertig */}
        {variants.length > 0 && (
          <section className="lj-row lj-section" style={{ marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <input
                className="lj-input"
                type="email"
                placeholder="deine@mail.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="lj-btn lj-btn-yellow"
              onClick={ready}
              disabled={qrLoading}
            >
              {qrLoading ? "Erstelle Link…" : "Fertig"}
            </button>
          </section>
        )}

        {/* 7) QR na dole */}
        {(qrLoading || qrDataUrl) && (
          <section className="lj-section" style={{ marginTop: 24 }}>
            <div className="lj-label">
              Um den Text für Ihren LinkedIn-Post verwenden zu können, scannen
              Sie bitte den folgenden QR-Code:
            </div>
            {qrLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="lj-spinner" aria-hidden="true"></span>
                <span>Bitte warten…</span>
              </div>
            )}

            {!qrLoading && qrDataUrl && qrLink && (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR-Code"
                  style={{
                    border: "6px solid #000",
                    padding: 6,
                    background: "#fff",
                    maxWidth: "100%",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 12,
                      wordBreak: "break-all",
                      color: "#b3b3b3",
                    }}
                  >
                    {qrLink}
                  </div>
                  <div className="lj-row">
                    <CopyButton isLink text={qrLink} />
                    <a
                      className="lj-btn lj-btn-outline"
                      href={qrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Seite öffnen
                    </a>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        <section className="lj-section">
          <div className="lj-label">Haftungs&shy;ausschluss</div>
          <p className="lj-paragraph">
            Die im Rahmen dieses Services bereitgestellten Textvorschläge werden
            automatisiert durch eine KI generiert. Wir übernehmen keine Gewähr
            für deren Vollständigkeit, Richtigkeit oder rechtliche
            Unbedenklichkeit. Die Verantwortung für die Nutzung, Veröffentlichung
            und inhaltliche Prüfung der Texte liegt ausschließlich bei den
            Teilnehmenden.
          </p>
        </section>
      </main>
    </>
  );
}