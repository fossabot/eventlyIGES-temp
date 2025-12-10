"use server";

import { db } from "@/lib/db";
import { CreateTicketTypeSchema, UpdateTicketTypeSchema } from "@/schemas/index";
import { z } from "zod";

export async function createTicketType(
  values: z.infer<typeof CreateTicketTypeSchema>
) {
  const validatedFields = await CreateTicketTypeSchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: validatedFields.error.message || "Campi non validi" };
  }
  const { eventId, name, description, price, quantity } = validatedFields.data;

  try {
    await db.ticketType.create({
      data: {
        eventId,
        name,
        description,
        price,
        quantity,
      },
    });
    // Invece del redirect, restituisci un oggetto di successo
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione del tipo di biglietto" };
  }
}

export async function updateTicketType(
  ticketTypeId: string,
  values: z.infer<typeof UpdateTicketTypeSchema>
) {
  const validatedFields = await UpdateTicketTypeSchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: validatedFields.error.message || "Campi non validi" };
  }
  const { name, description, price, quantity, isActive } = validatedFields.data;

  const existingTicketType = await db.ticketType.findUnique({
    where: { id: ticketTypeId },
  });
  if (!existingTicketType) {
    return { error: "Tipo di biglietto non trovato" };
  }

  try {
    await db.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        name,
        description,
        price,
        quantity,
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    // Invece del redirect, restituisci un oggetto di successo
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Errore durante l'aggiornamento del tipo di biglietto" };
  }
}
