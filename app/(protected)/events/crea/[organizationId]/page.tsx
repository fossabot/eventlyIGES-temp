"use server";


import EmptyState from '@/components/altre/empty-state';
import EventForm from '@/components/events/event-form';
import { getOrganizationById } from '@/data/organization';
import { currentUser } from '@/lib/auth';


interface CreateEventPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function CreateEventPage({ params }:CreateEventPageProps) {
    
    const {organizationId} = await params;

    const organizationResult = await getOrganizationById(organizationId as string || '');

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
    

    return (
        <>
        <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
  
    <h3 className="text-2xl font-bold text-center  ">
      Crea il tuo Evento
    </h3>
  
</section>

            <div>
                <EventForm organization={organizationResult.organization} type="create"/>
            </div>
            </>
    )
}
