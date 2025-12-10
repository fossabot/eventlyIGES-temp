
import { db } from "@/lib/db";

/**
 * Recupera l'organizzatore (o gli organizzatori) di una specifica organizzazione.
 * @param organizationId - L'ID dell'organizzazione di cui recuperare l'organizzatore.
 * @returns Un oggetto contenente gli organizzatori o un messaggio di errore.
 */
export async function getOrganizationOrganizers(organizationId: string) {
    try {
      if (!organizationId) {
        return { error: "ID organizzazione non fornito." };
      }
  
      const organizationUsers = await db.organizationUser.findMany({
        where: {
          organizationId: organizationId,
        },
        include: {
          user: true,
        },
      });
  
      if (organizationUsers.length === 0) {
        return {
          error: "Nessun organizzatore trovato per questa organizzazione.",
        };
      }
  
      const organizers = organizationUsers.map((orgUser) => orgUser.user);
  
      return { organizers };
    } catch (error) {
      console.error("Errore nel recuperare gli organizzatori:", error);
      return { error: "Errore nel recuperare gli organizzatori. Riprova più tardi." };
    }
  }
  
  /**
   * Recupera i dettagli di un'organizzazione specifica, inclusi gli organizzatori.
   * @param organizationId - L'ID dell'organizzazione da recuperare.
   * @returns Un oggetto contenente l'organizzazione e i suoi organizzatori o un messaggio di errore.
   */
  export async function getOrganizationById(organizationId: string) {
    try {
      if (!organizationId || typeof organizationId !== "string") {
        return { error: "ID organizzazione non valido o non fornito." };
      }
  
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: {
          organizationUsers: {
            include: {
              user: true,
            },
          },
        },
      });
  
      if (!organization) {
        return { error: "Organizzazione non trovata." };
      }
  
      const organizers = organization.organizationUsers.map((ou) => ou.user);
  
      // Campi "sicuri" da restituire
      const safeOrganization = {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        indirizzo: organization.indirizzo,
        phone: organization.phone,
        email: organization.email,
        comune: organization.comune,
        provincia: organization.provincia,
        regione: organization.regione,
        latitudine: organization.latitudine,
        longitudine: organization.longitudine,
        linkEsterno: organization.linkEsterno,
        createdAt: organization.createdAt.toISOString(),
        imageSrc: organization.imageSrc,
        stripeAccountId: organization.stripeAccountId,
        ticketingStatus: organization.ticketingStatus,
      };
  
      return { organization: safeOrganization, organizers };
    } catch (error) {
      console.error("Errore nel recuperare l'organizzazione:", error);
      return {
        error: "Errore nel recuperare l'organizzazione. Riprova più tardi.",
      };
    }
  }
  
  /**
   * Recupera tutte le organizzazioni gestite da un utente specifico.
   * @param userId - L'ID dell'utente di cui recuperare le organizzazioni gestite.
   * @returns Un oggetto contenente un array di organizzazioni o un messaggio di errore.
   */
  export async function getOrganizationsByUser(userId: string) {
    try {
      if (!userId || typeof userId !== "string") {
        return { error: "ID utente non valido o non fornito." };
      }
  
      const userOrganizations = await db.organizationUser.findMany({
        where: {
          userId: userId,
        },
        include: {
          organization: true,
        },
      });
  
      if (userOrganizations.length === 0) {
        return { error: "Nessuna organizzazione trovata per questo utente." };
      }
  
      const organizations = userOrganizations.map((orgUser) => {
        const organization = orgUser.organization;
        return {
          id: organization.id,
          name: organization.name,
          description: organization.description,
          indirizzo: organization.indirizzo,
          phone: organization.phone,
          email: organization.email,
          comune: organization.comune,
          provincia: organization.provincia,
          regione: organization.regione,
          latitudine: organization.latitudine,
          longitudine: organization.longitudine,
          linkEsterno: organization.linkEsterno,
          createdAt: organization.createdAt.toISOString(),
          imageSrc: organization.imageSrc,
          stripeAccountId: organization.stripeAccountId,
          ticketingStatus: organization.ticketingStatus,
        };
      });
  
      return { organizations };
    } catch (error) {
      console.error("Errore nel recuperare le organizzazioni dell'utente:", error);
      return {
        error: "Errore nel recuperare le organizzazioni. Riprova più tardi.",
      };
    }
  }
  