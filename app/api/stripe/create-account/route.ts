import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { organizationId, email } = await req.json();

    if (!organizationId || !email) {
      return NextResponse.json({ error: "Manca organizationId o email" }, { status: 400 });
    }

    // Creiamo l'account Stripe Express per l'organizzatore
    const account = await stripe.accounts.create({
      type: "express",
      country: "IT", // Cambia se necessario
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Salviamo l'accountId in database
    await db.organization.update({
      where: { id: organizationId },
      data: { stripeAccountId: account.id },
    });

    return NextResponse.json({ success: true, accountId: account.id });
  } catch (error) {
    console.error("Errore nella creazione dell'account Stripe:", error);
    return NextResponse.json({ error: "Errore nella creazione dell'account Stripe." }, { status: 500 });
  }
}
