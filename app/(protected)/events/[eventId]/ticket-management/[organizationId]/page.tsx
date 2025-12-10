"use server";


import { getEventById } from "@/data/event";
import { currentUser } from "@/lib/auth";
import { getTicketTypesForEvent } from "@/data/ticket-type"; // Server action per recuperare i TicketType dell'evento
import EmptyState from "@/components/altre/empty-state";
import TicketManagement from "@/components/typetickets/ticket-management";
import { getOrganizationById } from "@/data/organization";

interface TicketManagementPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TicketManagementPage({
  params,
}: TicketManagementPageProps) {
  const { organizationId, eventId } = await params;

  const organizationResult = await getOrganizationById(organizationId as string || "");
  const event = await getEventById(eventId as string || "");
  const user = await currentUser();

  // Controlla se l'organizzazione esiste
  if (!organizationResult || !organizationResult.organization) {
    return (
      <EmptyState
        title="Organizzazione non trovata"
        subtitle="La pagina che stai cercando non esiste."
        showToHome
      />
    );
  }

  // Controlla se l'utente è loggato
  if (!user || !user.id) {
    return (
      <EmptyState
        title="Non hai i permessi"
        subtitle="Effettua il login per accedere a questa pagina."
      />
    );
  }

  // Controlla se l'evento esiste
  if (!event || !event.id) {
    return (
      <EmptyState
        title="L'evento non esiste"
        subtitle="Qualcosa è andato storto."
        showToHome
      />
    );
  }

  // Verifica degli organizzatori
  const { organizers, error } = organizationResult;
  if (error) {
    return <EmptyState title="Errore" subtitle={error} />;
  }
  const isOrganizer = organizers.some((organizer) => organizer.id === user.id);
  if (!isOrganizer) {
    return (
      <EmptyState
        title="Accesso Negato"
        subtitle="Solo gli organizzatori possono accedere a questa pagina."
        showToHome
      />
    );
  }
  if (event.organizationId !== organizationId) {
    return (
      <EmptyState
        title="Accesso Negato"
        subtitle="Non hai il permesso per modificare questo evento."
        showToHome
      />
    );
  }
  const rawTicketTypes = await getTicketTypesForEvent(eventId as string);

  // Normalizza i dati: imposta i default per i campi opzionali, inclusi price e sold
  const ticketTypes = rawTicketTypes.map((tt) => ({
    id: tt.id,
    eventId: tt.eventId,
    name: tt.name,
    description: tt.description ?? undefined,
    price: tt.price ?? 0,      // Default a 0 se price è undefined
    quantity: tt.quantity,
    isActive: tt.isActive,
    sold: tt.sold ?? 0,        // Default a 0 se sold non è presente
  }));
  
  return (
    <>
      <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
        <h3 className="text-2xl font-bold text-center">
          Gestisci la Biglietteria per Evento
        </h3>
      </section>
  
      <div>
        <TicketManagement eventId={eventId as string} ticketTypes={ticketTypes} />
      </div>
    </>
  );
}

