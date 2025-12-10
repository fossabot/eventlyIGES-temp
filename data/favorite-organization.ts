import { db } from "@/lib/db";

/**
 * Controlla se un utente segue già una certa organizzazione
 */
export async function isFollowingOrganization(userId: string, organizationId: string) {
  if (!userId || !organizationId) {
    return false;
  }

  const follow = await db.favoriteOrganization.findFirst({
    where: { userId, organizationId },
  });

  return follow ? true : false;
}


export async function getOrganizationFollowersUserIds(organizationId: string): Promise<string[]> {
  if (!organizationId) return [];
  const rows = await db.favoriteOrganization.findMany({
    where: { organizationId },
    select: { userId: true },
  });
  return rows.map(r => r.userId);
}

/**
 * Ritorna le organizzazioni seguite da un utente.
 * Di default ritorna gli ID delle organizzazioni (string[]).
 * Se passi { full: true } ritorna l'array degli oggetti Organization.
 */
export async function getUserFollowing(
  userId: string,
  opts?: { full?: boolean }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<string[] | any[]> {
  if (!userId) return [];

  if (opts?.full) {
    // Oggetti Organization completi
    const rows = await db.favoriteOrganization.findMany({
      where: { userId },
      include: { organization: true },
    });
    // rows: { organization: Organization }[]
    return rows.map(r => r.organization);
  }

  // Solo gli ID delle organizzazioni
  const rows = await db.favoriteOrganization.findMany({
    where: { userId },
    select: { organizationId: true },
  });
  return rows.map(r => r.organizationId);
}