// lib/hubspot.ts
export async function upsertContact(email: string) {
  const HUBSPOT_API =
    "https://api.hubapi.com/crm/v3/objects/contacts?idProperty=email";

  const res = await fetch(HUBSPOT_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        email,
        firstname: "LinkedIn",
        lastname: "Post Generator",
        hs_legal_basis: "Legitimate interest – existing customer", // ✅ wymagane pole RODO
      },
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("❌ HubSpot upsert error:", text);
    throw new Error(
      "Nie udało się dodać lub zaktualizować kontaktu w HubSpocie"
    );
  }

  console.log("✅ HubSpot contact upsert successful:", email);
}
