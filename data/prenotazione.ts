// app/actions/getPrenotazione.ts
'use server';

import { db } from '@/lib/db';

export async function getPrenotazione(prenotazioneId: string) {
  try {
    const prenotazione = await db.prenotazione.findUnique({
      where: { id: prenotazioneId },
      include: { event: true, user: true },
    });

    if (!prenotazione) {
      throw new Error('Prenotazione non trovata');
    }

    return prenotazione;
  } catch (error) {
    console.error(error);
    throw new Error('Errore nel recupero della prenotazione');
  }
}

export async function hasUserReservation(userId: string, eventId: string) {
  const reservation = await db.prenotazione.findFirst({
    where: {
      userId,
      eventId,
    },
  });

  return reservation ? reservation.id : null;
}

export async function getReservationsByUser(userId: string) {
  try {
    const prenotazioni = await db.prenotazione.findMany({
      where: { userId },
      include: {
        event: true,
        user: true
      },
      orderBy: {
        reservedAt: 'desc'
      }
    });

    return prenotazioni;
  } catch (error) {
    console.error(error);
    throw new Error('Errore nel recupero delle prenotazioni');
  }
}

