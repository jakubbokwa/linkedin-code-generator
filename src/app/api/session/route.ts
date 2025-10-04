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

  // Użyj hosta z żądania (działa z <IP>:3000 i na prod)
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;
  const link = `${origin}/s/${rec.id}`;

  return NextResponse.json({ ok: true, id: rec.id, link });
}
