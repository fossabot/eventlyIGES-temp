import DateFilterBar from "@/components/altre/date-filter-bar";
import UpcomingEvents from "@/components/events/upcoming-events";
import NearbyEvents from "@/components/events/nearby-events";
import Section from "@/components/events/section";

import { currentUser } from "@/lib/auth";
import {
  getUserByIdCached,
  getUpcomingEventsCached,
  getNearbyEventsCached
} from "@/lib/cache";

export const revalidate = 60;

export default async function Home() {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserByIdCached(user.id) : null;

  const [upcomingEvents, nearbyEvents] = await Promise.all([
    getUpcomingEventsCached(),
    getNearbyEventsCached()
  ]);

  return (
    <main>
      <div className="pt-20">
        <DateFilterBar />

        <Section title="I prossimi eventi">
          <UpcomingEvents currentUser={fullUser} events={upcomingEvents} />
        </Section>
      </div>

      <Section title="Eventi Vicini a Te">
        <NearbyEvents currentUser={fullUser} events={nearbyEvents} />
      </Section>
    </main>
  );
}