import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { ticketId, userId } = await req.json();



    if (!ticketId || !userId) {
      return NextResponse.json({ error: "Manca ticketId o userId" }, { status: 400 });
    }

    // Recuperiamo i dettagli del tipo di biglietto e l'evento associato
    const ticketType = await db.ticketType.findUnique({
      where: { id: ticketId },
      include: { event: { include: { organization: true } } },
    });

    console.log("🔍 TICKET PRICE:", ticketType?.price);
    console.log("🔍 ORGANIZATION STRIPE ID:", ticketType?.event.organization?.stripeAccountId);

    if (!ticketType || !ticketType.event || !ticketType.event.organization || !ticketType.event.organization.stripeAccountId || !ticketType.price) {
      return NextResponse.json({ error: "Biglietto, evento o organizzazione non trovati." }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("❌ ERRORE: NEXT_PUBLIC_SITE_URL non è definito.");
      return NextResponse.json({ error: "Errore di configurazione: NEXT_PUBLIC_SITE_URL mancante." }, { status: 500 });
    }

    if (!ticketType.isActive) {
      return NextResponse.json({ error: "Il biglietto selezionato non è attivo." }, { status: 400 });
    }
    
    if (ticketType.quantity <= ticketType.sold) {
      return NextResponse.json({ error: "I biglietti in questione sono esuariti." }, { status: 400 });
    }

    const price = ticketType.price * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${ticketType.name} - ${ticketType.event.title}`,
              description: ticketType.description || "Biglietto per l'evento",
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type:"ticket",
        userId: userId,
        ticketTypeId: ticketType.id,
        eventId: ticketType.event.id,
        organizationName: ticketType.event.organization.name,
        organizationId: ticketType.event.organization.id,
        ticketTypeName: ticketType.name,

      },
      payment_intent_data: {
        metadata: {
          type:"ticket",
          userId: userId,
          ticketTypeId: ticketType.id,
          eventId: ticketType.event.id,
          organizationName: ticketType.event.organization.name,
          organizationId: ticketType.event.organization.id,
          ticketTypeName: ticketType.name,
        },
        application_fee_amount: Math.round(price * 0.1),
        description: `Pagamento per l'evento: ${ticketType.event.title}`, // Aggiunge il nome dell'evento
        transfer_data: {
          destination: ticketType.event.organization.stripeAccountId,
        },
      },
      success_url: `${siteUrl}/my-tickets`,
      cancel_url: `${siteUrl}`,
      locale: "it",
    });
    
    

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Errore nella creazione della sessione di checkout:", error);
    return NextResponse.json({ error: "Errore nella creazione del checkout." }, { status: 500 });
  }
}
