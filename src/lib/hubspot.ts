export async function upsertContact(email: string) {
  const body = {
    properties: [
      { property: "email", value: email },
      // tu możesz dodać własne properties lub zgody
    ],
  };

  const r = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(
      email
    )}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`HubSpot error: ${txt}`);
  }
}
