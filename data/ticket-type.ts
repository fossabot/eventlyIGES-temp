"use server";
import { db } from "@/lib/db";

export async function getTicketTypesForEvent(eventId: string) {
  if (!eventId) {
    throw new Error("L'ID dell'evento è richiesto.");
  }

  try {
    const ticketTypes = await db.ticketType.findMany({
      where: { eventId },
    });

    return ticketTypes.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Errore durante il recupero dei tipi di biglietti:", error);
    throw new Error("Impossibile recuperare i tipi di biglietti per l'evento.");
  }
}

export async function getActiveTicketsByEvent(eventId: string) {
  if (!eventId) {
    throw new Error("L'ID dell'evento è richiesto.");
  }

  try {
    const activeTickets = await db.ticketType.findMany({
      where: {
        eventId,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });

    return activeTickets.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Errore durante il recupero dei biglietti attivi:", error);
    throw new Error("Impossibile recuperare i biglietti attivi per l'evento.");
  }
}
