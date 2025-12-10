"use server";

import { db } from "@/lib/db";
import { CreateEventSchema } from "@/schemas";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCoordinatesFromOSM } from "@/lib/map";
import { getOrganizationById, getOrganizationOrganizers } from "@/data/organization";
import { getOrganizationFollowersUserIds } from "@/data/favorite-organization";
import { notifyUsers } from "./notification";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
  const validatedFields = await CreateEventSchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const {
    title,
    description,
    imageSrc,
    category,
    organizationId,
    eventDate,
    indirizzo,
    comune,
    provincia,
    regione,
    status,
    isReservationActive,
  } = validatedFields.data;

  const organizer = await getOrganizationOrganizers(organizationId);
  if (!organizer || !organizer.organizers) {
    return { error: "Organizzatore non trovato" };
  }

  const organization = await getOrganizationById(organizationId);
  if (!organization || !organization.organization) {
    return { error: "Organizzazione non trovata" };
  }

  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;

  const coords = await getCoordinatesFromOSM(indirizzo, comune);
  if (!coords.latitude || !coords.longitude) return { error: "Indirizzo non valido" };

  const latitudine  = coords.latitude.toString();
  const longitudine = coords.longitude.toString();

  // "pubblico" -> ACTIVE, altrimenti HIDDEN
  const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";

  let newEvent;
  try {
    newEvent = await db.event.create({
      data: {
        title,
        description,
        imageSrc: finalImageSrc,
        indirizzo,
        category,
        eventDate,
        comune,
        latitudine,
        longitudine,
        provincia,
        regione,
        organizationId,
        status: mappedStatus,
        isReservationActive,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione dell'evento" };
  }

  // INVIO NOTIFICA AI FOLLOWER (solo se evento è pubblico)
  if (mappedStatus === "ACTIVE") {
    try {
      const followerIds = await getOrganizationFollowersUserIds(organizationId);
      if (followerIds.length) {
        await notifyUsers({
          title: "Nuovo evento",
          message: `${organization.organization.name} ha pubblicato: ${title}`,
          link: `/events/${newEvent.id}`,
          senderOrganizationId: organizationId,
          userIds: followerIds,
        });
      }
    } catch (err) {
      // Non bloccare il redirect: logga e vai avanti
      console.error("Errore nell'invio notifiche ai follower:", err);
    }
  }

  redirect(`/events/${newEvent.id}`);
}


export async function updateEvent(
  eventId: string,
  values: z.infer<typeof CreateEventSchema>
) {
  // Validazione dei campi in ingresso
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const {
    title,
    description,
    imageSrc,
    category,
    organizationId,
    eventDate,
    indirizzo,
    comune,
    provincia,
    regione,
    status,
    isReservationActive,
  } = validatedFields.data;

  // Controlla che l'evento esista
  const existingEvent = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    return { error: "Evento non trovato" };
  }

  // Verifica che l'organizzazione e i suoi organizzatori esistano
  const organizer = await getOrganizationOrganizers(organizationId);
  if (!organizer || !organizer.organizers) {
    return { error: "Organizzatore non trovato" };
  }

  const organization = await getOrganizationById(organizationId);
  if (!organization || !organization.organization) {
    return { error: "Organizzazione non trovata" };
  }

  // Gestione dell'immagine: se è una stringa vuota, la trasformiamo in undefined
  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;

  let latitudine: string | null = null;
  let longitudine: string | null = null;

  const coords = await getCoordinatesFromOSM(indirizzo, comune);

  if (!coords.latitude || !coords.longitude) return { error: "Indirizzo non valido" };

  latitudine = coords.latitude.toString() || "";
  longitudine = coords.longitude.toString() || "";

  // Mapping dello status
  const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";

  let updatedEvent;
  try {
    updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        imageSrc: finalImageSrc,
        indirizzo,
        category,
        eventDate,
        comune,
        latitudine,
        longitudine,
        provincia,
        regione,
        organizationId,
  
        isReservationActive,
        status: mappedStatus,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Errore durante l'aggiornamento dell'evento" };
  }

  redirect(`/events/${updatedEvent.id}`);
}
