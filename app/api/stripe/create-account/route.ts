import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe"; 


export { db };


export async function POST(req: Request) {
  const { organizationId } = await req.json();

  // Trova l'organizzazione
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization || !organization.stripeAccountId) {
    return NextResponse.json({ error: "Organizzazione o Stripe ID non trovato" }, { status: 404 });
  }

  // 🔒 Controllo stripe
  if (!stripe) {
    console.warn("⚠️ Stripe disabilitato: manca STRIPE_SECRET_KEY");
    // Mock dati per build/deploy statico o ambiente senza chiave
    return NextResponse.json({
      payouts_enabled: false,
      charges_enabled: false,
      details_submitted: false,
      stripeAccountId: "mock_id",
      requirements: [],
      dashboard_url: "#",
    });
  }

  // Chiamata reale a Stripe
  const account = await stripe.accounts.retrieve(organization.stripeAccountId);

  return NextResponse.json({
    payouts_enabled: account.payouts_enabled,
    charges_enabled: account.charges_enabled,
    details_submitted: account.details_submitted,
    stripeAccountId: account.id,
    requirements: account.requirements ?? [],
    dashboard_url: `https://dashboard.stripe.com/${account.id}`,
  });
}
