"use server";

import { db } from "@/lib/db";
import { Ticket } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sendUserNotification } from "./notification";


export async function createTicketActionandUpdateSold(
  eventId: string,
  userId: string,
  ticketTypeId: string,
  paymentStripeId: string,
  methodPaymentId: string,
  paid: number
): Promise<{ success: boolean; ticket?: Ticket; error?: string }> {
  try {
    // Genera un codice univoco per il biglietto (QR Code)
    const ticketCode = uuidv4();

    const ticketType = await db.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    // Transazione: incrementa sold + crea ticket
    const result = await db.$transaction(async (tx) => {
      const updatedTicketType = await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { sold: { increment: 1 } },
      });

      const ticket = await tx.ticket.create({
        data: {
          eventId,
          userId,
          ticketTypeId,
          qrCode: ticketCode,
          isValid: true,
          paymentStripeId,
          methodPaymentId,
          paid,
        },
      });

      return { ticket, updatedTicketType };
    });

    console.log("✅ Biglietto creato con successo:", result.ticket);
    console.log("✅ Contatore biglietti venduti aggiornato:", result.updatedTicketType.sold);

    // Recupero evento (per titolo e org mittente) e invio notifica
    const evt = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, organizationId: true },
    });

    if (evt) {
      await sendUserNotification({
        userId,
        title: "Acquisto confermato",
        message: `Hai acquistato un biglietto per: ${evt.title}`,
        link: `/events/${evt.id}`,             // opzionalmente link al ticket specifico
        senderOrganizationId: evt.organizationId ?? undefined,
      });
    }

    return { success: true, ticket: result.ticket };
  } catch (error) {
    console.error("❌ Errore nella creazione del biglietto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore nella creazione del biglietto",
    };
  }
}