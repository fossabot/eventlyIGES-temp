"use server"

import { Suspense } from "react";
import UpcomingEvents from "@/components/events/upcoming-events";
import Section from "@/components/events/section";
import NearbyEvents from "@/components/events/nearby-events";
import Loading from "../loading";
import { currentUser } from "@/lib/auth";
import { getUserByIdCached } from "@/lib/cache";
import { User } from "@prisma/client";
import DateFilterBar from "@/components/altre/date-filter-bar";

export default async function Home() {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserByIdCached(user.id) : null;
  // Renderizza immediatamente uno skeleton UI mentre i dati vengono caricati
  return (
    <main>
      <div className="pt-20">
        <DateFilterBar />
        <Section title="I prossimi eventi">
          <Suspense fallback={<Loading />}>
            <UpcomingEventsWrapper fullUser={fullUser} />
          </Suspense>
        </Section>
      </div>
      <Section title="Eventi Vicini a Te">
        <Suspense fallback={<Loading />}>
          <NearbyEventsWrapper fullUser={fullUser}/>
        </Suspense>
      </Section>
    </main>
  );
}

// Componenti wrapper per spostare il caricamento dei dati in componenti separati
async function UpcomingEventsWrapper({ fullUser }: { fullUser: User | null }) {
  return <UpcomingEvents currentUser={fullUser} />;
}

async function NearbyEventsWrapper({ fullUser }: { fullUser: User | null }) {
  return <NearbyEvents currentUser={fullUser} />;
}