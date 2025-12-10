import EmptyState from "@/components/altre/empty-state";
import { getTicketById } from "@/data/ticket";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import TicketDetails from "@/components/events/ticket/ticket-client";


interface TicketPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
    const { id } = await params;

    if (!id) {
        return (
            <EmptyState 
                title="Errore" 
                subtitle="ID del biglietto non valido." 
                showToHome
            />
        );
    }

    // Recupera il biglietto dal database
    const ticket = await getTicketById(id as string);

    // Controlla se il biglietto esiste
    if (!ticket || !ticket.id) {
        return (
            <EmptyState 
                title="Biglietto non trovato" 
                subtitle="Il biglietto che stai cercando non esiste." 
                showToHome
            />
        );
    }

    // Ottieni l'utente attualmente loggato
    const user = await currentUser();

    // Se non c'è un utente loggato, mostra un messaggio di errore
    if (!user || !user.id) {
        return (
            <EmptyState 
                title="Accesso Negato" 
                subtitle="Effettua il login per visualizzare questo biglietto." 
            />
        );
    }

    // Recupera l'utente completo con i suoi dati
    const fullUser = await getUserById(user.id);

    // Verifica se l'utente è il proprietario del biglietto
    if (ticket.userId !== user.id) {
        return (
            <EmptyState 
                title="Accesso Negato" 
                subtitle="Non hai i permessi per visualizzare questo biglietto." 
                showToHome
            />
        );
    }

    return (
        <TicketDetails ticket={ticket} fullUser={fullUser} />
    );
}
