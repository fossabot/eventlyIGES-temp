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

const GridContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 pt-5 md:pt-2">
    {children}
  </div>
);

const FavoritesPage = async () => {
  const user = await currentUser();
  if (!user?.id) {
    return <EmptyState title="Non hai i permessi" subtitle="Effettua il login" />;
  }

  const [result, favoriteOrgsRaw, fullUser] = await Promise.all([
    getFavorites(user.id),
    getUserFollowing(user.id, { full: true }),
    getUserById(user.id),
  ]);

  const favoriteEvents = result.events ?? [];
  const favoriteOrgs = Array.isArray(favoriteOrgsRaw) ? favoriteOrgsRaw : [];

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

      {favoriteEvents.length > 0 && (
        <Container>
          <h4 className="text-xl font-semibold mt-6 mb-2">Eventi</h4>
          <Suspense fallback={<Loading />}>
            <GridContainer>
              <EventList events={favoriteEvents} currentUser={fullUser as User} />
            </GridContainer>
          </Suspense>
        </Container>
      )}

      {favoriteOrgs.length > 0 && (
        <Container>
          <h4 className="text-xl font-semibold mt-10 mb-2">Organizzazioni che segui</h4>
          <Suspense fallback={<Loading />}>
            <GridContainer>
              <OrganizationList organizations={favoriteOrgs} />
            </GridContainer>
          </Suspense>
        </Container>
      )}
    </>
  );
};

export default FavoritesPage;
