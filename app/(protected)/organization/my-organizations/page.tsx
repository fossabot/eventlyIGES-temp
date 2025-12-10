
import EmptyState from "@/components/altre/empty-state";
import { currentUser } from "@/lib/auth";
import OrganizationList from "@/components/organization/organization-list";
import { getOrganizationsByUser } from "@/data/organization";

const  MyOrganizationPage = async () => {
    
    // Estrai l'ID dai parametri di ricerca

    const user = await currentUser();



    const organizations = await getOrganizationsByUser(user?.id || '');

    // Controlla se l'organizzazione è stata trovata e se esiste
    if (!organizations || organizations.organizations?.length === 0) {
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


   

    return (

        <>
        <div className="text-2xl">Le mie organizzazioni</div>
          <div
          className="
            pt-24
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
                <OrganizationList organizations={organizations.organizations || []} isOrganizationCreator/>
        </div>
      </>   
    )
}

export default MyOrganizationPage;
