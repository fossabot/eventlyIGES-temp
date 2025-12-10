"use server"

import { SafeEvent } from "@/app/types";
import { db } from "@/lib/db";
import { manualStatus } from "@prisma/client";


export const getEventById = async (id: string) => {
    try {
    const event = await db.event.findUnique({
        where: {
            id
        },
    })
    if(!event) return null;
    return {
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(), 
        
        };// Converte la data in stringa ISO
    
    } catch (error){
        console.error(error);
        return null;
    }
}

export const getEvents = async () => {
    try {
    const events = await db.event.findMany({});
    if(!events) return null;
    return events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(), // Converte la data in stringa ISO
    }));
    } catch (error){
        console.error(error);
        return null;
    }
}


export const getAllEvents = async (query = "", limit = 6, page = 1, category = "", dateFilter = "") => {
  try {
    // Calcolo dell'offset per la paginazione
    const offset = (page - 1) * limit;

    // Creazione della query dinamica per Prisma
    // Gestione del filtro per data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayOfWeek = today.getDay(); // 0 = domenica, 6 = sabato
    const friday = new Date(today);
    friday.setDate(friday.getDate() + (dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek));
    friday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);
    
    // Costruzione del filtro per data in base all'opzione selezionata
    let dateFilterCondition = {};
    if (dateFilter === 'today') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilterCondition = {
        eventDate: {
          gte: today,
          lte: endOfDay
        }
      };
    } else if (dateFilter === 'tomorrow') {
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);
      dateFilterCondition = {
        eventDate: {
          gte: tomorrow,
          lte: endOfTomorrow
        }
      };
    } else if (dateFilter === 'weekend') {
      dateFilterCondition = {
        eventDate: {
          gte: friday,
          lte: sunday
        }
      };
    } else {
      // Se non c'è un filtro per data, mantieni il filtro predefinito (eventi futuri)
      dateFilterCondition = { eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } };
    }
    
    const filters = {
      where: {
        AND: [
          ...(category ? [{ category: category }] : []),
          ...(query ? [{ title: { contains: query, mode: "insensitive" as const } }] : []),
          // Applica il filtro per data
          dateFilterCondition,
        ],
      },
      take: limit,
      skip: offset,
      orderBy: {
        // Ordina per data di creazione, dal più recente
        eventDate: "asc" as const,
      },
    };

    // Eseguo la query con Prisma
    const events = await db.event.findMany(filters);

    // Conta totale degli eventi per la paginazione
    const totalEvents = await db.event.count({ where: filters.where });

    return {
      events: events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(),
      })),
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      events: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
};


export const getAllActiveEvents = async (
  query = "",
  limit = 6,
  page = 1,
  category = "",
  dateFilter = ""
) => {
  try {
    // Calcolo dell'offset per la paginazione
    const offset = (page - 1) * limit;

    // Creazione della query dinamica per Prisma
    // Gestione del filtro per data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayOfWeek = today.getDay(); // 0 = domenica, 6 = sabato
    const friday = new Date(today);
    friday.setDate(friday.getDate() + (dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek));
    friday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);
    
    // Costruzione del filtro per data in base all'opzione selezionata
    let dateFilterCondition = {};
    if (dateFilter === 'today') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilterCondition = {
        eventDate: {
          gte: today,
          lte: endOfDay
        }
      };
    } else if (dateFilter === 'tomorrow') {
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);
      dateFilterCondition = {
        eventDate: {
          gte: tomorrow,
          lte: endOfTomorrow
        }
      };
    } else if (dateFilter === 'weekend') {
      dateFilterCondition = {
        eventDate: {
          gte: friday,
          lte: sunday
        }
      };
    } else {
      // Se non c'è un filtro per data, mantieni il filtro predefinito (eventi futuri)
      dateFilterCondition = { eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } };
    }
    
    const filters = {
      where: {
        AND: [
          ...(category ? [{ category: category }] : []),
          ...(query ? [{ title: { contains: query, mode: "insensitive" as const } }] : []),
          { status: manualStatus.ACTIVE },
          // Applica il filtro per data
          dateFilterCondition,
        ],
      },
      take: limit,
      skip: offset,
      orderBy: {
        // Ordina per data di creazione, dal più recente
        eventDate: "asc" as const,
      },
    };

    // Eseguo la query con Prisma
    const events = await db.event.findMany(filters);

    // Conta totale degli eventi per la paginazione
    const totalEvents = await db.event.count({ where: filters.where });

    return {
      events: events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(),
      })),
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      events: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
};

export async function getRelatedEventsByCategory(
    category: string,
    limit: number = 5,
    excludeEventId?: string
  ): Promise<(SafeEvent & { eventDate: string; createdAt: string })[]> {
    try {
      // Costruiamo la clausola where per Prisma, includendo un filtro per la data (come nel tuo getAllEvents)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        category,
        status : manualStatus.ACTIVE,
        eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      };
  
      // Se vogliamo escludere un evento specifico (per esempio, l'evento corrente)
      if (excludeEventId) {
        whereClause.id = { not: excludeEventId };
      }
  
      // Eseguiamo la query per trovare gli eventi correlati, ordinati per data
      const events = await db.event.findMany({
        where: whereClause,
        orderBy: {
          eventDate: "asc",
        },
        take: limit,
      });
  
      // Convertiamo le date in stringhe ISO per comodità lato client
      return events.map((event) => ({
        ...event,
        eventDate: event.eventDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("Error in getRelatedEventsByCategory:", error);
      return [];
    }
  }

  
/**
 * Recupera tutti gli eventi associati a una specifica organizzazione.
 *
 * @param organizationId - L'ID dell'organizzazione.
 * @param limit - Numero massimo di eventi da restituire per pagina (default: 6).
 * @param page - Numero di pagina per la paginazione (default: 1).
 * @returns Un oggetto contenente gli eventi e le informazioni di paginazione o un messaggio di errore.
 */
export const getEventsByOrganization = async (
  organizationId: string,
  limit = 6,
  page = 1
) => {
  try {
    // Validazione dell'ID organizzazione
    if (!organizationId || typeof organizationId !== "string") {
      return { error: "ID organizzazione non valido o non fornito." };
    }

    // Calcolo dell'offset per la paginazione
    const offset = (page - 1) * limit;

    // Recupero eventi associati all'organizzazione con paginazione
    const filters = {
      where: {
        organizationId: organizationId,
        // Filtra eventi con data entro 4 ore dal presente
        eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      },
      take: limit,
      skip: offset,
      orderBy: {
        eventDate: "asc" as const,
      },
    };

    const events = await db.event.findMany(filters);

    const totalEvents = await db.event.count({ where: filters.where });

    return {
      events: events.map((event) => ({
        ...event,
        eventDate: event.eventDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
      })),
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    };
  } catch (error) {
    console.error("Errore nel recuperare gli eventi per l'organizzazione:", error);
    return {
      events: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
      error: "Errore nel recuperare gli eventi. Riprova più tardi.",
    };
  }
};
export async function getUpcomingEvents(): Promise<SafeEvent[]> {
  const result = await getAllActiveEvents("", 6, 1);
  return result?.events || [];
}

export async function getNearbyEvents(): Promise<SafeEvent[]> {
  const result = await getAllActiveEvents("", 6, 1);
  return result?.events || [];
}
