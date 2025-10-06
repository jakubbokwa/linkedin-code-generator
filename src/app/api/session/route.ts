/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, chosenPost, basePrompt, photoDataUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: "E-Mail fehlt" });
    }

    // 1️⃣ Zapisz sesję w bazie (tak jak wcześniej)
    const session = await prisma.session.create({
      data: {
        email,
        chosenPost,
        basePrompt,
        photoData: photoDataUrl || null,
      },
    });

    // 2️⃣ Wywołaj lokalny endpoint /api/hubspot — on doda kontakt do HubSpota
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      const hubspotRes = await fetch(`${baseUrl}/api/hubspot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!hubspotRes.ok) {
        const text = await hubspotRes.text();
        console.warn("⚠️ HubSpot local API error:", text);
      } else {
        console.log("✅ Email sent to HubSpot:", email);
      }
    } catch (err) {
      console.warn("⚠️ HubSpot local API call failed:", err);
    }

    // 3️⃣ Zwróć link do indywidualnej strony
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/s/${session.id}`;

    return NextResponse.json({ ok: true, link });
  } catch (err: any) {
    console.error("❌ Session error:", err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
