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

    // Creiamo un link per accedere alla dashboard Stripe
    const loginLink = await stripe!.accounts.createLoginLink(organization.stripeAccountId);

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error("Errore nella generazione del login link di Stripe:", error);
    return NextResponse.json({ error: "Errore nella generazione del login link." }, { status: 500 });
  }
}
