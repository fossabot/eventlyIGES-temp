import EmptyState from "@/components/altre/empty-state";

import { getPrenotazione } from "@/data/prenotazione";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import BookingDetails from "@/components/events/prenotazione/prenotazione-client";

interface BookingPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
    const {id} = await params;

    if (!id) {
        return (
            <EmptyState 
                title="Errore" 
                subtitle="ID della prenotazione non valido." 
                showToHome
            />
        );
    }

    // Recupera la prenotazione dal database
    const prenotazione = await getPrenotazione(id as string);

    // Controlla se la prenotazione esiste
    if (!prenotazione || !prenotazione.id) {
        return (
            <EmptyState 
                title="Prenotazione non trovata" 
                subtitle="La prenotazione che stai cercando non esiste." 
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
                subtitle="Effettua il login per visualizzare questa prenotazione." 
            />
        );
    }

    // Recupera l'utente completo con i suoi dati
    const fullUser = await getUserById(user.id);

    // Verifica se l'utente è il proprietario della prenotazione
    if (prenotazione.userId !== user.id) {
        return (
            <EmptyState 
                title="Accesso Negato" 
                subtitle="Non hai i permessi per visualizzare questa prenotazione." 
                showToHome
            />
        );
    }

    return (
        <BookingDetails prenotazione={prenotazione} fullUser={fullUser} />
    );
}
