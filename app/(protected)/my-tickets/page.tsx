import { currentUser } from "@/lib/auth";
import { getTicketsByUser } from "@/data/ticket";

import EmptyState from "@/components/altre/empty-state";
import TicketList from "@/components/events/ticket/ticket-list";

export default async function TicketsPage() {
    // Ottieni l'utente attualmente loggato
    const user = await currentUser();

    if (!user || !user.id) {
        return (
            <EmptyState 
                title="Accesso Negato" 
                subtitle="Effettua il login per visualizzare i tuoi biglietti." 
            />
        );
    }

    // Recupera i biglietti dell'utente
    const tickets = await getTicketsByUser(user.id);

    if (!tickets || tickets.length === 0) {
        return (
            <EmptyState 
                title="Nessun Biglietto" 
                subtitle="Non hai ancora acquistato nessun biglietto." 
                showToHome
            />
        );
    }

    return <TicketList tickets={tickets} />;
}
