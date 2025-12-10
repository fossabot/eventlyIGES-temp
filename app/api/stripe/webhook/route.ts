
import { createTicketActionandUpdateSold } from "@/actions/ticket";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Errore: Firma Stripe mancante!");
    return new NextResponse("Firma di Stripe mancante", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.arrayBuffer();
    const buf = Buffer.from(rawBody);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("❌ Errore nella verifica del webhook:", err);
    return new NextResponse(`Webhook Error:`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log("💰 Pagamento ricevuto!");
    console.log(`ID Pagamento: ${paymentIntent.id}`);
    console.log(`Importo: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);

    if (paymentIntent.metadata.type === "ticket") {
      const eventId = paymentIntent.metadata.eventId;
      const userId = paymentIntent.metadata.userId;
      const ticketTypeId = paymentIntent.metadata.ticketTypeId;
      const paymentStripeId = paymentIntent.id;
      const methodPaymentId = paymentIntent.payment_method as string;
      const paid = paymentIntent.amount; // Stripe invia gli importi in centesimi

      

      try {
        const ticket = await createTicketActionandUpdateSold(eventId, userId, ticketTypeId, paymentStripeId, methodPaymentId, paid);
        console.log("✅ Biglietto creato:", ticket);
      } catch (error) {
        console.error("❌ Errore nella creazione del biglietto:", error);
      }
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
