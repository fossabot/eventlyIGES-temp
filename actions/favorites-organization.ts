"use server";

import { db } from "@/lib/db";

/**
 * Segui un'organizzazione (aggiungi ai preferiti organizzazioni)
 */
export async function followOrganization(organizationId: string, userId: string) {
  if (!organizationId || typeof organizationId !== "string") {
    throw new Error("ID dell'organizzazione non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    await db.$transaction(async (prisma) => {
      // Verifica utente
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("Utente non trovato.");

      // Verifica organizzazione
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true },
      });
      if (!organization) throw new Error("Organizzazione non trovata.");

      // Controlla se già seguita
      const existing = await prisma.favoriteOrganization.findUnique({
        where: { userId_organizationId: { userId, organizationId } },
      });
      if (existing) {
        throw new Error("L'organizzazione è già seguita.");
      }

      // Crea relazione di follow
      await prisma.favoriteOrganization.create({
        data: { userId, organizationId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Errore durante il follow:", error);
    throw new Error("Errore durante il follow dell'organizzazione.");
  }
}

/**
 * Smetti di seguire un'organizzazione
 */
export async function unfollowOrganization(organizationId: string, userId: string) {
  if (!organizationId || typeof organizationId !== "string") {
    throw new Error("ID dell'organizzazione non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    await db.$transaction(async (prisma) => {
      // Verifica utente
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("Utente non trovato.");

      // Rimuovi (idempotente: se non c'è, non esplode)
      await prisma.favoriteOrganization.deleteMany({
        where: { userId, organizationId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Errore durante l'unfollow:", error);
    throw new Error("Errore durante l'unfollow dell'organizzazione.");
  }
}
