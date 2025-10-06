import { NextRequest, NextResponse } from "next/server";
import { upsertContact } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Brak e-maila" }, { status: 400 });

    await upsertContact(email);

    return NextResponse.json({ ok: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
