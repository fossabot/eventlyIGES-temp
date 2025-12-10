import { Suspense } from "react";
import { User } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { getFavorites } from "@/actions/favorites-event";
import Container from "@/components/altre/container";
import Loading from "@/app/loading";
import EmptyState from "@/components/altre/empty-state";
import EventList from "@/components/events/events-list";
import { getUserFollowing } from "@/data/favorite-organization";
import OrganizationList from "@/components/organization/organization-list";


const FavoritesPage = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    return <EmptyState title="Non hai i permessi" subtitle="Effettua il login" />;
  }

  // Carico in parallelo eventi preferiti + org seguite + user completo
  const [result, favoriteOrgsRaw, fullUser] = await Promise.all([
    getFavorites(user.id),
    getUserFollowing(user.id, { full: true }),
    getUserById(user.id),
  ]);

  const favoriteEvents = result.events ?? [];
  const favoriteOrgs = Array.isArray(favoriteOrgsRaw) ? favoriteOrgsRaw : [];

  // Se non ci sono né eventi né organizzazioni, empty state unico
  if (favoriteEvents.length === 0 && favoriteOrgs.length === 0) {
    return (
      <EmptyState
        title="Nessun preferito ancora"
        subtitle="Aggiungi eventi e segui organizzazioni per vederli qui!"
        showToHome
      />
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold text-center">I tuoi preferiti</h3>

      {/* Sezione Eventi preferiti */}
      {favoriteEvents.length > 0 && (
        <Container>
          <h4 className="text-xl font-semibold mt-6 mb-2">Eventi</h4>
          <div
            className="
              pt-5 md:pt-2
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              2xl:grid-cols-6
              gap-8
            "
          >
            <Suspense fallback={<Loading />}>
              <EventList events={favoriteEvents} currentUser={fullUser as User} />
            </Suspense>
          </div>
        </Container>
      )}

      {/* Sezione Organizzazioni seguite */}
      {favoriteOrgs.length > 0 && (
        <Container>
          <h4 className="text-xl font-semibold mt-10 mb-2">Organizzazioni che segui</h4>
          <div
            className="
              pt-5 md:pt-2
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              2xl:grid-cols-6
              gap-8
            "
          >
            {/* Se OrganizationList ha props diverse, adatta qui */}
            <OrganizationList organizations={favoriteOrgs} />
          </div>
        </Container>
      )}
    </>
  );
};

export default FavoritesPage;
