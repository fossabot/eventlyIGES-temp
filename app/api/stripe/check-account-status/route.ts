import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Manca organizationId" }, { status: 400 });
    }

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || !organization.stripeAccountId) {
      return NextResponse.json({ error: "Organizzazione non trovata o non collegata a Stripe." }, { status: 404 });
    }

    const account = await stripe!.accounts.retrieve(organization.stripeAccountId);

    return NextResponse.json({
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      stripeAccountId: account.id,
      requirements: account.requirements?.currently_due || [],
      dashboard_url: `https://dashboard.stripe.com/connect/accounts/${account.id}`,
    });
  } catch (error) {
    console.error("Errore nel recupero dello stato dell'account Stripe:", error);
    return NextResponse.json({ error: "Errore nel recupero dello stato dell'account Stripe." }, { status: 500 });
  }
}
