import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, renderLinkedInPost } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Brak promptu" }, { status: 400 });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Kontekst: ${prompt}` },
        ],
        temperature: 0.7,
      }),
    });

    const json = await r.json();
    if (!r.ok) {
      return NextResponse.json(
        { error: json?.error?.message || "OpenAI error" },
        { status: 500 }
      );
    }

    const content = json.choices?.[0]?.message?.content || "";
    const post = renderLinkedInPost(content);

    return NextResponse.json({ post });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
