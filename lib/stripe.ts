import Stripe from "stripe";
import { db } from "./db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function updateOrganizationTicketingStatus(stripeId: string, status: string) {
  // 🔍 Trova l'organizzazione collegata all'account Stripe
  const organization = await db.organization.findFirst({
    where: { stripeAccountId: stripeId },
  });

  if (!organization) {
    console.error(`❌ Organizzazione non trovata per Stripe ID: ${stripeId}`);
    throw new Error("Organizzazione non trovata.");
  }

  // ✅ Prendi l'ID dell'organizzazione corretta
  const organizationId = organization.id;

  // 🔹 Se non c'è uno Stripe ID, assegna stato "no_stripe"
  if (!organization.stripeAccountId) {
    await db.organization.update({
      where: { id: organizationId },
      data: { ticketingStatus: "no_stripe" },
    });
    return "no_stripe";
  }

  // ✅ Aggiorna lo stato nel database
  await db.organization.update({
    where: { id: organizationId },
    data: { ticketingStatus: status },
  });

  console.log(`✅ Stato aggiornato per Organization ID ${organizationId}: ${status}`);
  return status;
}
