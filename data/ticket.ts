""use server";

import { db } from "@/lib/db";

export async function getTicketById(ticketId: string) {
    try {
        const ticket = await db.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: true,
                ticketType: true,
            },
        });
        return ticket;
    } catch (error) {
        console.error("Errore nel recupero del biglietto:", error);
        return null;
    }
}


export async function getTicketsByUser(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  try {
    const tickets = await db.ticket.findMany({
      where: { userId },
      include: {
        event: true,
        ticketType: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return tickets;
  } catch (error) {
    console.error("❌ Errore nel recupero dei biglietti:", error);
    return [];
  }
}



