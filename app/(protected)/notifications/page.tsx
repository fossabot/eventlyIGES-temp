// /app/notifications/page.tsx (o percorso equivalente)
import { Suspense } from "react";
import { currentUser } from "@/lib/auth";

import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import Loading from "@/app/loading";

import { getUserNotifications } from "@/data/notification";

const NotificationsPage = async () => {
  const user = await currentUser();

  if (!user || !user.id) {
    return <EmptyState title="Non hai i permessi" subtitle="Effettua il login" />;
  }

  const notifications = await getUserNotifications(user.id);

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Nessuna notifica"
        subtitle="Qui vedrai gli aggiornamenti importanti dalle organizzazioni che segui."
        showToHome
      />
    );
  }

  return (
    <>
      <h3 className="text-2xl font-bold text-center">Le tue notifiche</h3>

      <Container>
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
            gap-6
          "
        >
          <Suspense fallback={<Loading />}>
            {notifications.map((n) => (
              <article
                key={n.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <h4 className="text-base font-semibold">{n.title}</h4>

                <p className="mt-1 text-sm text-gray-700">{n.message}</p>

                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm underline"
                  >
                    Apri
                  </a>
                )}

                <time
                  className="mt-2 block text-xs text-gray-500"
                  dateTime={n.createdAt.toISOString()}
                >
                  {n.createdAt.toLocaleString("it-IT")}
                </time>
              </article>
            ))}
          </Suspense>
        </div>
      </Container>
    </>
  );
};

export default NotificationsPage;
