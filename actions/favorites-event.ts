"use server";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
export async function addFavorite(eventId: string, userId: string) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("ID dell'evento non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    await db.$transaction(async (prisma) => {
      // Recupera l'utente dal database
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new Error("Utente non trovato.");
      }

      // Controlla se l'evento è già nei preferiti
      const favoriteIds = [...(user.favoriteIds || [])];
      if (favoriteIds.includes(eventId)) {
        throw new Error("L'evento è già tra i preferiti.");
      }

      // Aggiungi l'evento ai preferiti
      favoriteIds.push(eventId);

      // Aggiorna l'utente e il conteggio dei preferiti
      await Promise.all([
        db.user.update({
          where: { id: userId },
          data: { favoriteIds },
        }),
        db.event.update({
          where: { id: eventId },
          data: { favoriteCount: { increment: 1 } },
        }),
      ]);
    });
    
    return { success: true };
  } catch (error) {
    console.error("Errore durante l'aggiunta ai preferiti:", error);
    throw new Error("Errore durante l'aggiunta ai preferiti.");
  }
}
export async function removeFavorite(eventId: string, userId: string) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("ID dell'evento non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    await db.$transaction(async (prisma) => {
      // Recupera l'utente dal database
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new Error("Utente non trovato.");
      }

      // Rimuovi l'evento dai preferiti
      const favoriteIds = [...(user.favoriteIds || [])].filter((id) => id !== eventId);

      // Aggiorna l'utente e decrementa il conteggio dei preferiti
      await Promise.all([
        db.user.update({
          where: { id: userId },
          data: { favoriteIds },
        }),
        db.event.update({
          where: { id: eventId },
          data: { favoriteCount: { decrement: 1 } },
        }),
      ]);
    });

    return { success: true };
  } catch (error) {
    console.error("Errore durante la rimozione dai preferiti:", error);
    throw new Error("Errore durante la rimozione dai preferiti.");
  }
}

export async function getFavorites(userId: string) {
  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    // Recupera l'utente dal database
    const user = await getUserById(userId);

    if (!user) {
      throw new Error("Utente non trovato.");
    }

    // Recupera gli eventi preferiti
    const events = await db.event.findMany({
      where: {
        id: {
          in: user.favoriteIds || [],
        },
      },
    });

     // Ritorno dei risultati e della paginazione
     return {
      events: events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Errore durante il recupero dei preferiti:", error);
    throw new Error("Errore durante il recupero dei preferiti.");
  }
}
