// app/actions/bookingActions.ts
"use server";

import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendUserNotification } from "./notification";


export async function createBookingAction(eventId: string, userId: string) {
  // Genera un codice univoco per la prenotazione
  const bookingCode = uuidv4();

  // Crea la prenotazione nel database con il codice generato
  const booking = await db.prenotazione.create({
    data: {
      eventId,
      userId,
      qrCode: bookingCode,
    },
  });

  // Recupero evento (per titolo e org mittente)
  const evt = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, organizationId: true },
  });

  // Invia notifica di conferma prenotazione (best effort: non blocca il flow)
  if (evt) {
    await sendUserNotification({
      userId,
      title: "Prenotazione confermata",
      message: `Hai prenotato correttamente: ${evt.title}`,
      link: `/events/${evt.id}`,
      senderOrganizationId: evt.organizationId ?? undefined,
    });
  }

  return { booking };
}