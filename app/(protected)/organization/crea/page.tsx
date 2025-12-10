"use client";


import EmptyState from '@/components/altre/empty-state';
import OrganizationForm from '@/components/organization/organization-form';
import { useCurrentUser } from '@/hooks/use-current-user';


const CreateOrganizationPage = () => {

    const user = useCurrentUser();
    if(user?.role === 'USER' || !user)
        {
            return (
                <EmptyState title="Non hai i permessi" subtitle="Torna alla home" showToHome/>
            )
        }

    return (
        <>
        <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
  
    <h3 className="text-2xl font-bold text-center  ">
      Crea la tua organizzazione
    </h3>
  
</section>

            <div>
                <OrganizationForm userIdprops={user?.id || ''} type="create"/>
            </div>
            </>
    )
}

export default CreateOrganizationPage;