/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import QRCode from "qrcode"; // <— nowy import
import { BASE_PROMPT_DE, OPTION_TAGS } from "@/lib/constants";
import CopyButton from "./components/CopyButton";

export default function Home() {
  const [photoDataUrl, setPhotoDataUrl] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // nowy stan dla QR
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const toggleOpt = (opt: string) =>
    setSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );

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
      // wyczyszczamy poprzedni QR (jeśli był)
      setQrLink(null);
      setQrDataUrl(null);
    } catch (e: any) {
      alert(e.message ?? "Fehler bei der Generierung");
    } finally {
      setLoading(false);
    }
  };

  const ready = async () => {
    if (picked === null) return alert("Bitte eine Variante auswählen.");
    if (!email) return alert("Bitte E-Mail eingeben.");

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
    <main className="lj-container">
      <h1 className="lj-h1">
        JOIN THE TEAM <span className="lj-slash">/</span>
        <br /> AND BECOME A JOE
      </h1>

      {/* 1) Foto */}
      <section className="lj-section">
        <label className="lj-label">1) Foto anhängen (optional)</label>
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
            style={{ marginTop: 12 }}
          />
        )}
      </section>

      {/* 2) Basis-Prompt */}
      <section className="lj-section">
        <label className="lj-label">2) Basis-Prompt</label>
        <textarea
          className="lj-textarea lj-readonly"
          readOnly
          value={BASE_PROMPT_DE}
          rows={5}
        />
      </section>

      {/* 3) Checkboxy akcentów */}
      <section className="lj-section">
        <label className="lj-label">3) Zusätzliche Akzente (optional)</label>
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
              style={{ padding: 10 }}
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
              : "Erneut generieren"
            : loading
            ? "Generiere…"
            : "Generieren"}
        </button>
      </div>

      {/* 5) Warianty A/B/C */}
      {variants.length > 0 && (
        <section className="lj-section">
          <p className="lj-label" style={{ marginBottom: 8 }}>
            4) Wähle genau eine Variante
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
                onChange={() => setPicked((prev) => (prev === i ? null : i))}
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
            <label className="lj-label">E-Mail</label>
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

      {/* 7) Sekcja QR na dole */}
      {(qrLoading || qrDataUrl) && (
        <section className="lj-section" style={{ marginTop: 24 }}>
          <div className="lj-label">Dein persönlicher Link</div>

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
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 6,
                    wordBreak: "break-all",
                  }}
                >
                  {qrLink}
                </div>
                <div className="lj-row">
                  <a
                    className="lj-btn lj-btn-outline"
                    href={qrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Seite öffnen
                  </a>
                  <CopyButton text={qrLink} />
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
