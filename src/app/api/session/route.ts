import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addNoteToContact } from "@/lib/hubspot";

const BodySchema = z.object({
  email: z.string().email(),
  chosenPost: z.string().min(5),
  basePrompt: z.string().min(3),
  photoDataUrl: z.string().optional(),
});

export async function POST(req: Request) {
  const { email, chosenPost, basePrompt, photoDataUrl } = BodySchema.parse(
    await req.json()
  );

  const rec = await prisma.session.create({
    data: { email, chosenPost, basePrompt, photoData: photoDataUrl },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/s/${rec.id}`;

  // HubSpot: zapisz kontakt + notatkę z linkiem
  try {
    await addNoteToContact(email, "LinkedIn-Post erstellt", `Link: ${link}`);
  } catch (e) {
    console.warn("HubSpot błąd:", e);
  }

  return NextResponse.json({ ok: true, id: rec.id, link });
}
