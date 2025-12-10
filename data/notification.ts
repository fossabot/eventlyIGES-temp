// /data/notification.ts
import { db } from "@/lib/db";

export type UserNotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: Date;
};

/**
 * Restituisce le notifiche indirizzate all'utente (più recenti prima).
 * Mostra solo i campi: id, title, message, link, createdAt.
 */
export async function getUserNotifications(userId: string): Promise<UserNotificationItem[]> {
  if (!userId) return [];

  const rows = await db.notification.findMany({
    where: {
      userNotifications: {
        some: { userId },
      },
    },
    select: {
      id: true,
      title: true,
      message: true,
      link: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows;
}
