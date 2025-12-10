import Stripe from "stripe";
import { db } from "./db";

// 🔒 Stripe "safe": parte solo se la variabile esiste
export const stripe =
  process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export async function updateOrganizationTicketingStatus(stripeId: string, status: string) {
  // Se Stripe non è attivo, evita l'errore in build e non fare nulla
  if (!stripe) {
    console.warn("⚠️ Stripe disabilitato: manca STRIPE_SECRET_KEY");
    return "stripe_disabled";
  }

  // 🔍 Trova l'organizzazione collegata all'account Stripe
  const organization = await db.organization.findFirst({
    where: { stripeAccountId: stripeId },
  });

  if (!organization) {
    console.error(`❌ Organizzazione non trovata per Stripe ID: ${stripeId}`);
    throw new Error("Organizzazione non trovata.");
  }

  const organizationId = organization.id;

  if (!organization.stripeAccountId) {
    await db.organization.update({
      where: { id: organizationId },
      data: { ticketingStatus: "no_stripe" },
    });
    return "no_stripe";
  }

  await db.organization.update({
    where: { id: organizationId },
    data: { ticketingStatus: status },
  });

  console.log(`✅ Stato aggiornato per Organization ID ${organizationId}: ${status}`);
  return status;
}
