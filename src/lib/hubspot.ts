// src/lib/hubspot.ts

// Integracja z HubSpot jest na razie WYŁĄCZONA.
// Dzięki tym eksportom aplikacja się skompiluje,
// ale nic nie wyśle do HubSpota.

export const hubspot = null;

export async function upsertContact(_email: string) {
  // TODO: odkomentować prawdziwą implementację, gdy HubSpot będzie wdrożony
  return null;
}

export async function addNoteToContact(
  _email: string,
  _title: string,
  _body: string
) {
  // TODO: odkomentować prawdziwą implementację, gdy HubSpot będzie wdrożony
  return;
}

// import { Client } from "@hubspot/api-client";

// const token = process.env.HUBSPOT_ACCESS_TOKEN!;
// export const hubspot = token ? new Client({ accessToken: token }) : null;

// export async function upsertContact(email: string) {
//   if (!hubspot) return null;
//   const search = await hubspot.crm.contacts.searchApi.doSearch({
//     filterGroups: [
//       { filters: [{ propertyName: "email", operator: "EQ", value: email }] },
//     ],
//     properties: ["email"],
//     limit: 1,
//   });
//   if (search.results?.[0]) return search.results[0];
//   const created = await hubspot.crm.contacts.basicApi.create({
//     properties: { email },
//   });
//   return created;
// }

// export async function addNoteToContact(
//   email: string,
//   title: string,
//   body: string
// ) {
//   if (!hubspot) return;
//   const contact = await upsertContact(email);
//   const contactId = contact?.id;
//   const note = await hubspot.crm.objects.basicApi.create("notes", {
//     properties: { hs_note_body: body, hs_note_title: title },
//   });
//   if (contactId) {
//     await hubspot.crm.associations.v4.basicApi.create(
//       "notes",
//       note.id!,
//       "contacts",
//       contactId,
//       [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }]
//     );
//   }
// }
