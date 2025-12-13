"use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventList from "@/components/events/events-list";
import { SafeNearbyEvent } from "@/app/types/nearby";
import { User } from "@prisma/client";
import ClientPagination from "@/components/altre/pagination";
import Link from "next/link";
import { Button } from "../ui/button";
import useLocation from "@/hooks/use-location";

interface NearbyEventsProps {
  currentUser?: User | null;
}

const NearbyEvents: React.FC<NearbyEventsProps> = ({ currentUser }) => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const query = searchParams.get("query") || "";
  const dateFilter = searchParams.get("dateFilter") || "";

  const [nearbyEvents, setNearbyEvents] = useState<SafeNearbyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageNearby, setPageNearby] = useState<number>(1);
  const [serverPage, setServerPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const eventsPerPage = 5;

  const { userCoords } = useLocation();

  // Fetch iniziale o al cambio dei filtri
  useEffect(() => {
    if (!userCoords) return;

    setNearbyEvents([]);
    setPageNearby(1);
    setServerPage(1);
    setHasMore(true);
    setLoading(true);

    const fetchNearbyEvents = async () => {
      try {
        const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
          category
        )}&query=${encodeURIComponent(query)}&dateFilter=${encodeURIComponent(dateFilter)}&limit=10&page=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
          setNearbyEvents([]);
        } else {
          setNearbyEvents(data.events as SafeNearbyEvent[]);
        }
      } catch {
        setNearbyEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyEvents();
  }, [userCoords, category, query, dateFilter]);

  if (loading) return <div>Caricamento eventi vicini...</div>;
  if (!userCoords) return <div>Coordinate non disponibili.</div>;
  if (!nearbyEvents.length)
    return (
      <>
        <div>Nessun evento trovato.</div>
        <Link href="/">
          <Button variant={"outline"} size={"default"}>
            Rimuovi i filtri
          </Button>
        </Link>
      </>
    );

  const startIndex = (pageNearby - 1) * eventsPerPage;
  const paginatedEvents = nearbyEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(nearbyEvents.length / eventsPerPage);

  const fetchMoreEvents = async () => {
    const newServerPage = serverPage + 1;
    const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
      category
    )}&query=${encodeURIComponent(query)}&dateFilter=${encodeURIComponent(dateFilter)}&limit=10&page=${newServerPage}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.events.length > 0) {
        setNearbyEvents((prev) => [...prev, ...data.events]);
        setServerPage(newServerPage);
        if (data.events.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      console.error("Errore nel caricamento degli eventi vicini.");
    }
  };

  return (
    <div>
      <div
        key={pageNearby}
        className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8"
      >
        <EventList events={paginatedEvents} currentUser={currentUser as User} />
      </div>
      <ClientPagination totalPages={totalPages} page={pageNearby} setPage={setPageNearby} />
      {nearbyEvents.length >= eventsPerPage && (
        <div className="flex justify-center mt-4">
          <button
            disabled={!hasMore}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md transition ${
              !hasMore ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            onClick={fetchMoreEvents}
          >
            Vedi Altro
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyEvents;