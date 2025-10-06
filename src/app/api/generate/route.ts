/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { BASE_PROMPT_DE, OPTION_TAGS } from "@/lib/constants";

const BodySchema = z.object({
  basePrompt: z.string().default(BASE_PROMPT_DE),
  selected: z.array(z.enum(OPTION_TAGS)).default([]),
  photoDataUrl: z.string().optional(), // data:image/... (opcjonalnie)
});

// pomocnicze: czyści i pewnie dzieli tekst na 3 warianty
function splitIntoVariants(raw: string): string[] {
  const txt = (raw || "").replace(/\r/g, "").trim();

  // 1) preferowany podział po linii '---'
  let parts = txt.split(/\n-{3,}\n/);

  // jeśli model jednak nie wstawił '---', spróbujmy alternatyw
  if (parts.length < 2) {
    // spróbuj po pustych liniach
    const byBlank = txt.split(/\n\s*\n+/);
    if (byBlank.length >= 3) parts = byBlank;
  }
  if (parts.length < 2) {
    // spróbuj po myślnikach/listach
    const byBullets = txt.split(/\n[-*•]\s+/);
    if (byBullets.length >= 3) parts = byBullets;
  }
  if (parts.length < 2) {
    // czasem model zwróci JSON/markdown — spróbuj wydobyć linie niepuste
    const lines = txt
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    // heurystyka: zlepiaj w 3 krótkie fragmenty po 2–4 linie
    const approx: string[] = [];
    for (let i = 0; i < lines.length; i += Math.ceil(lines.length / 3) || 1) {
      approx.push(
        lines.slice(i, i + Math.ceil(lines.length / 3) || 1).join(" ")
      );
      if (approx.length === 3) break;
    }
    parts = approx.length ? approx : [txt];
  }

  // sprzątanie: usuwamy ``` ... ```, cudzysłowy, numerację itd.
  parts = parts
    .map((p) =>
      p
        .replace(/```[\s\S]*?```/g, "") // bloki code fence
        .replace(/```/g, "")
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/^\s*[\-\*\d\.\)]\s+/, "") // bullet/num prefix
        .trim()
    )
    .filter((p) => p.length > 0);

  // ogranicz długość (na wszelki wypadek)
  parts = parts.map((p) => (p.length > 500 ? p.slice(0, 500).trim() : p));

  // zapewnij dokładnie 3 elementy
  if (parts.length > 3) parts = parts.slice(0, 3);
  while (parts.length < 3) parts.push("—");

  return parts;
}

export async function POST(req: Request) {
  const { basePrompt, selected, photoDataUrl } = BodySchema.parse(
    await req.json()
  );

  const accents = selected.length
    ? `Berücksichtige optional und dezent diese Akzente (nicht zwingend alle): ${selected.join(
        ", "
      )}.`
    : `Kein zusätzlicher Akzent ausgewählt.`;

  const imgHint = photoDataUrl
    ? "Es gibt ein begleitendes Foto – nutze es nur als Stimmungsimpuls, nicht beschreiben."
    : "Kein Foto vorhanden.";

  const system = [
    "Du erstellst drei sehr kurze LinkedIn-Posts auf Deutsch.",
    "Jeder Post: 2–3 Sätze, professionell, menschlich, ohne Emojis, max. 2 sinnvolle Hashtags, leichte CTA optional.",
    "Kein JSON, keine Aufzählungen, keine Code-Fences, keine Überschriften.",
    "Ausgabeformat: Schreibe die DREI Varianten nacheinander,",
    "und oddziel sie linią zawierającą wyłącznie trzy myślniki: --- (na osobnej linii).",
    "Kein zusätzlicher Text vor oder nach den Varianten.",
    "Länge pro Variante: idealnie ≤ 400 Zeichen.",
    "Please also spellcheck the whole text very thoroughly."
  ].join(" ");

  const user = [
    `Basis-Text: "${basePrompt}"`,
    accents,
    imgHint,
    "WICHTIG: Gib GENAU drei Varianten zurück, getrennt durch die Linie ---.",
  ].join("\n");

  try {
    const rsp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = rsp.choices[0]?.message?.content ?? "";
    const variants = splitIntoVariants(raw);

    return NextResponse.json({ ok: true, variants });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
