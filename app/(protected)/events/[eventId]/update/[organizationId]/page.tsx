"use server";


import EmptyState from '@/components/altre/empty-state';
import EventForm from '@/components/events/event-form';
import { getEventById } from '@/data/event';
import { getOrganizationById } from '@/data/organization';
import { currentUser } from '@/lib/auth';


interface CreateEventPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function CreateEventPage({ params }:CreateEventPageProps) {
    
    const {organizationId , eventId} = await params;

    const organizationResult = await getOrganizationById(organizationId as string || '');

    const event = await getEventById(eventId as string || '');

    const user = await currentUser();

    // Controlla se l'organizzazione è stata trovata e se esiste
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

        
        // Controlla se l'evento esiste è loggato
        if (!event || !event.id) {
            return (
            <EmptyState 
                title="L'evento non esiste" 
                subtitle="Qualcosa è andato storto."
                showToHome 
            />
            );
        }
    
        // Estrai l'organizzazione e gli organizzatori dal risultato
        const { organizers, error } = organizationResult;
       
        // Controlla se c'è un errore
        if (error) {
        return (
            <EmptyState 
                title="Errore" 
                subtitle={error} 
            />
            );
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
    
        if(event.organizationId !== organizationId){
            return (
                <EmptyState 
                    title="Accesso Negato" 
                    subtitle="Non hai il permesso per modificare questo evento." 
                    showToHome
                />
            );
        }
    return (
        <>
        <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
  
    <h3 className="text-2xl font-bold text-center  ">
      Aggiorna il tuo Evento
    </h3>
  
</section>

            <div>
                <EventForm organization={organizationResult.organization} event={event} type="update"/>
            </div>
            </>
    )
}
