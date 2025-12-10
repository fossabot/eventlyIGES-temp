"use server";

import { db } from "@/lib/db";

/**
 * Crea una nuova notifica nel sistema
 */
export async function createNotification({
  title,
  message,
  link,
  senderOrganizationId,
}: {
  title: string;
  message: string;
  link?: string;
  senderOrganizationId?: string;
}) {
  try {
    const notification = await db.notification.create({
      data: {
        title,
        message,
        link,
        senderOrganizationId,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Errore durante la creazione della notifica:", error);
    throw new Error("Impossibile creare la notifica.");
  }
}

/**
 * Crea una notifica e la collega a una lista di userId.
 * Se userIds è vuoto non fa nulla.
 */
export async function notifyUsers({
  title,
  message,
  link,
  senderOrganizationId,
  userIds,
}: {
  title: string;
  message: string;
  link?: string;
  senderOrganizationId?: string;
  userIds: string[];
}) {
  if (!userIds?.length) return { success: true, deliveredTo: 0 };

  const res = await createNotification({ title, message, link, senderOrganizationId });
  if (!res?.success || !res?.notification?.id) {
    throw new Error("Impossibile creare la notifica.");
  }

  await db.userNotification.createMany({
    data: userIds.map((userId) => ({
      userId,
      notificationId: res.notification.id,
    })),
    skipDuplicates: true,
  });

  return { success: true, deliveredTo: userIds.length, notificationId: res.notification.id };
}


/**
 * Crea una notifica e la assegna a un singolo utente (pivot user_notification).
 * Non lancia errori bloccanti: se fallisce logga e continua.
 */
export async function sendUserNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
  senderOrganizationId?: string;
}) {
  try {
    const { userId, title, message, link, senderOrganizationId } = params;

    const res = await createNotification({ title, message, link, senderOrganizationId });
    const notificationId = res.notification.id;

    await db.userNotification.create({
      data: { userId, notificationId },
    });

    return { success: true, notificationId };
  } catch (err) {
    console.error("Errore invio notifica all'utente:", err);
    return { success: false };
  }
}