// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { to, post, attachmentBase64, attachmentName, attachmentType } =
//       await req.json();
//     if (!to || !post) {
//       return NextResponse.json(
//         { error: "Brak adresu e-mail lub treści" },
//         { status: 400 }
//       );
//     }

//     const html = `
//       <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial">
//         <p>Cześć!</p>
//         <p>Poniżej szkic posta na LinkedIn wygenerowany podczas wydarzenia:</p>
//         <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${String(
//           post
//         )
//           .replace(/&/g, "&amp;")
//           .replace(/</g, "&lt;")
//           .replace(/>/g, "&gt;")}</pre>
//         <p>Powodzenia z publikacją! ✨</p>
//       </div>`;

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const payload: any = {
//       from: process.env.RESEND_FROM!,
//       to,
//       subject: "Twój post na LinkedIn — szkic",
//       text: post,
//       html,
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       attachments: [] as any[],
//     };

//     if (attachmentBase64 && attachmentName) {
//       payload.attachments.push({
//         filename: attachmentName,
//         content: attachmentBase64, // czyste base64 (bez data:)
//         contentType: attachmentType || undefined,
//       });
//     }

//     const r = await fetch("https://api.resend.com/emails", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const json = await r.json();
//     if (!r.ok) {
//       return NextResponse.json(
//         { error: json?.message || "Resend error" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ id: json?.id || "ok" });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { to, post } = await req.json();
  if (!to || !post) {
    return NextResponse.json(
      { error: "Brak adresu e-mail lub treści" },
      { status: 400 }
    );
  }

  // Mock wysyłki — tylko log na serwerze
  console.log("Mock email send →", { to, post });

  return NextResponse.json({ ok: true, mock: true });
}
