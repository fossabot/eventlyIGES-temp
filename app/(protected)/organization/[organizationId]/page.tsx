// app/(...)/organizzazioni/[organizationId]/page.tsx  (o dov’è la tua pagina)

import EmptyState from "@/components/altre/empty-state";
import OrganizationClient from "@/components/organization/organization-client";
import { isFollowingOrganization } from "@/data/favorite-organization";
import { getOrganizationById } from "@/data/organization";
import { currentUser } from "@/lib/auth";


interface OrganizationPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { organizationId } = await params;

  const user = await currentUser();

  const organizationResult = await getOrganizationById((organizationId as string) || "");
  if (!organizationResult || !organizationResult.organization) {
    return (
      <EmptyState
        title="Organizzazione non trovata"
        subtitle="La pagina che stai cercando non esiste."
        showToHome
      />
    );
  }

  if (!user || !user.id) {
    return (
      <EmptyState
        title="Non hai i permessi"
        subtitle="Effettua il login per accedere a questa pagina."
      />
    );
  }

  // Check follow state server-side
  const follow = await isFollowingOrganization(user.id, organizationResult.organization.id);

  return (
    <OrganizationClient
      organization={organizationResult.organization}
      userId={user.id}
      initialFollowing={!!follow}
    />
  );
}
