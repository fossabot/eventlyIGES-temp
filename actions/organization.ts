// actions/organizations.ts
"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/data/user"; // Assicurati che il percorso sia corretto
import { organizationSchema } from "@/schemas";
import { z } from "zod";
import { OrganizationRole } from "@prisma/client"; // Assicurati che il ruolo sia definito nel tuo schema Prisma
import { redirect } from "next/navigation";
import { getCoordinatesFromOSM } from "@/lib/map";
/**
 * Crea una nuova organizzazione.
 * @param values - I campi validati dall'organizationSchema.
 * @param userId - L'ID dell'utente che sta creando l'organizzazione.
 * @returns un oggetto con chiavi success o error.
 */
export async function createOrganization(
  values: z.infer<typeof organizationSchema>,
  userId: string
) {
  // 1. Validazione dei dati
  const validatedFields = organizationSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi. Per favore, verifica i dati inseriti." };
  }

  const {
    name,
    description,
    indirizzo,
    phone,
    email,
    linkEsterno,
    imageSrc,
    comune,
    provincia,
    regione,
 
  } = validatedFields.data;

  // 2. Verifica che l'utente esista e sia un ORGANIZERN
  const user = await getUserById(userId);
  if (!user || user.role === "USER") {
    return { error: "Assicurati di essere un organizzatore." };
  }
  // 4. Pulizia del campo immagine
  const finalImageSrc = imageSrc?.trim() === "" ? "/images/NERO500.jpg" : imageSrc; //TODO

  

  let latitudine: string | null = null;
  let longitudine: string | null = null;

if (indirizzo && comune) {
  const coords = await getCoordinatesFromOSM(indirizzo, comune);
  
  // Convertiamo i numeri in stringa prima di salvarli
  latitudine = coords.latitude ? coords.latitude.toString() : null;
  longitudine = coords.longitude ? coords.longitude.toString() : null;
}

  // 6. Creazione dell'organizzazione
  let newOrganization;
  try {
    newOrganization = await db.organization.create({
      data: {
        name,
        description,
        indirizzo,
        phone,
        email,
        linkEsterno,
        latitudine,
        longitudine,
        imageSrc: finalImageSrc,
        comune,
        regione,
        provincia
      },
    });
  } catch (error) {
    console.error("Errore durante la creazione dell'organizzazione:", error);
    return { error: "Errore durante la creazione dell'organizzazione. Riprova più tardi."
    };
  }

  // 7. Associazione Utente-Organizzazione
  try {
    await db.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: newOrganization.id,
        role: OrganizationRole.ADMIN_ORGANIZZATORE,
      },
    });
  } catch (error) {
    console.error("Errore durante l'associazione utente-organizzazione:", error);
    // Se l'associazione fallisce, elimina l'organizzazione creata
    await db.organization.delete({ where: { id: newOrganization.id } });
    return {
      error: "Errore durante l'associazione con l'organizzazione. Riprova più tardi.",
    };
  }

  // 8. Restituzione del Successo
  return { success: "Organizzazione creata con successo!", organization: newOrganization };
}


/**
 * Aggiorna un'organizzazione esistente.
 * @param organizationId - L'ID dell'organizzazione da aggiornare.
 * @param values - I campi da aggiornare, validati tramite lo schema parziale di organizationSchema.
 * @param userId - L'ID dell'utente che sta tentando l'aggiornamento.
 * @returns Un oggetto contenente un messaggio di successo e l'organizzazione aggiornata, oppure un messaggio di errore.
 */
export async function updateOrganization(
  organizationId: string,
  values: Partial<z.infer<typeof organizationSchema>>,
  userId: string
) {
  // 1. Validazione dei dati con uno schema parziale (aggiornare non significa dover reinserire tutto)
  const validatedFields = organizationSchema.partial().safeParse(values);
  if (!validatedFields.success) {
    return { error: "Campi non validi. Per favore, verifica i dati inseriti." };
  }
  const updateData = validatedFields.data;

  // 2. Verifica che l'organizzazione esista
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) {
    return { error: "Organizzazione non trovata." };
  }

  // 3. Verifica che l'utente esista ed è autorizzato ad aggiornare l'organizzazione
  //    Qui controlliamo che l'utente sia associato all'organizzazione come ADMIN_ORGANIZZATORE.
  const organizationUser = await db.organizationUser.findFirst({
    where: {
      organizationId,
      userId,
    },
  });
  if (!organizationUser) {
    return { error: "Non hai i permessi per aggiornare questa organizzazione." };
  }

  // 5. Pulizia del campo immagine: se l'immagine è una stringa vuota, forniamo quella di default
  if ("imageSrc" in updateData) {
    updateData.imageSrc =
      updateData.imageSrc?.trim() === "" ? "/images/NERO500.jpg" : updateData.imageSrc;
  }

  
  let latitudine: string | null = null;
  let longitudine: string | null = null;

  if (updateData.indirizzo && updateData.comune) {
  const coords = await getCoordinatesFromOSM(updateData.indirizzo, updateData.comune);
  
  // Convertiamo i numeri in stringa prima di salvarli
  latitudine = coords.latitude ? coords.latitude.toString() : null;
  longitudine = coords.longitude ? coords.longitude.toString() : null;
}
 const updatedData = { ...updateData, latitudine, longitudine };

  // 6. Aggiornamento dell'organizzazione nel database
  let updatedOrganization;
  try {
    updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: updatedData
    });
      
    // Una volta aggiornato, si redirige alla pagina dell'organizzazione
    
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'organizzazione:", error);
    return { error: "Errore durante l'aggiornamento dell'organizzazione. Riprova più tardi." };
  }
   // Una volta aggiornato, si redirige alla pagina dell'evento
   redirect(`/organization/${updatedOrganization.id}`);
}




