
import EmptyState from "@/components/altre/empty-state";
import EventList from "@/components/events/events-list";
import OrganizationManagement from "@/components/organization/organization-management";
import { currentUser } from "@/lib/auth";
import { getEventsByOrganization } from "@/data/event";
import { User } from "@prisma/client";
import { getUserById } from "@/data/user";
import StripeAccountButton from "@/components/altre/stripe-button";
import StripeAccountStatus from "@/components/altre/stripe-account-status";
import { getOrganizationById } from "@/data/organization";

interface OrganizationPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function OrganizationPage({ params }: OrganizationPageProps) {
    
    const {organizationId} = await params;
    
    // Estrai l'ID dai parametri di ricerca

    const user = await currentUser();

    const organizationResult = await getOrganizationById(organizationId as string || '');

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
    const { organization, organizers, error } = organizationResult;
   
    // Controlla se c'è un errore
    if (error) {
    return (
        <EmptyState 
            title="Errore" 
            subtitle={error} 
        />
        );
    }   

    
    // Verifica se l'utente corrente è tra gli organizzatori
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

    const events = await getEventsByOrganization(organization.id);
   
    let fullUser = null;
    if(user && user.id){
      fullUser = await getUserById(user.id);
    }
    return (
        <>
       
            <OrganizationManagement organization={organization} />

        <div>I miei eventi</div>
        <div
          className="
            grid
            grid-cols-1
            sm-grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
              {/* ✅ Aggiunto il componente per verificare lo stato dell'account Stripe */}
      <StripeAccountStatus organizationId={organization.id} />
            <StripeAccountButton organizationId={organization.id} email={organization.email || ""} stripeAccountId={organization.stripeAccountId || null}  />
            <EventList events={events.events || []} currentUser={fullUser as User} isEventCreator={true}/>
            </div>
        </>
    )
}

