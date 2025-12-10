import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Manca organizationId" }, { status: 400 });
    }

    // Recuperiamo l'account Stripe dell'organizzazione
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || !organization.stripeAccountId) {
      return NextResponse.json({ error: "Organizzazione non trovata o non collegata a Stripe." }, { status: 404 });
    }

    // Creiamo un link di onboarding per completare la verifica
    const accountLink = await stripe.accountLinks.create({
      account: organization.stripeAccountId,
      refresh_url: process.env.NEXT_PUBLIC_SITE_URL,  // URL se qualcosa va storto
      return_url: process.env.NEXT_PUBLIC_SITE_URL, // Dove tornare dopo la verifica
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Errore nella generazione del link di onboarding:", error);
    return NextResponse.json({ error: "Errore nella generazione del link di onboarding." }, { status: 500 });
  }
}
