"use server";

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


export async function getTicketsByUser(userId: string) {
    try {
        const tickets = await db.ticket.findMany({
            where: { userId },
            include: {
                event: true, // Includi i dettagli dell'evento
                ticketType: true, // Includi i dettagli del tipo di biglietto
            },
            orderBy: { createdAt: "desc" }, // Ordina i biglietti dal più recente al più vecchio
        });

        return tickets;
    } catch (error) {
        console.error("❌ Errore nel recupero dei biglietti:", error);
        return [];
    }
}
