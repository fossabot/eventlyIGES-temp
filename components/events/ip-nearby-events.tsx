// components/events/NearbyEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventList from "@/components/events/events-list";
import { SafeNearbyEvent } from "@/app/types/nearby";
import { User } from "@prisma/client";
import ClientPagination from "@/components/altre/pagination";
import Link from "next/link";
import { Button } from "../ui/button";

interface IpNearbyEventsProps {
  currentUser?: User | null;
}

const IpNearbyEvents: React.FC<IpNearbyEventsProps> = ({ currentUser }) => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const query = searchParams.get("query") || "";

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<SafeNearbyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageNearby, setPageNearby] = useState<number>(1);
  const [serverPage, setServerPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const eventsPerPage = 5;

  // Ottieni le coordinate dell'utente tramite geolocalizzazione basata su IP
  useEffect(() => {
    const fetchUserCoords = async () => {
      try {
        const res = await fetch("/api/ip");
        const data = await res.json();
        // ip-api restituisce "lat" e "lon": mappiamo lon su lng
        if (data.lat && data.lon) {
          setUserCoords({ lat: data.lat, lng: data.lon });
        } else {
          setUserCoords(null);
        }
      } catch (error) {
        console.error("Errore nel recupero delle coordinate IP-based", error);
        setUserCoords(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCoords();
  }, []);

  // Quando i filtri (query o category) cambiano, resettiamo la paginazione e ricarichiamo gli eventi
  useEffect(() => {
    if (userCoords) {
      // Reset di tutti gli stati di paginazione e caricamento
      setNearbyEvents([]);
      setPageNearby(1);
      setServerPage(1);
      setHasMore(true);
      setLoading(true);

      const fetchNearbyEvents = async () => {
        try {
          const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
            category
          )}&query=${encodeURIComponent(query)}&limit=10&page=1`;
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
    }
  }, [userCoords, category, query]);

  if (loading) return null;
  if (!userCoords) return <div>Coordinate non disponibili.</div>;
  if (!nearbyEvents || nearbyEvents.length === 0)
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

  // Paginazione locale: seleziona gli eventi per la pagina corrente
  const startIndex = (pageNearby - 1) * eventsPerPage;
  const paginatedEvents = nearbyEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(nearbyEvents.length / eventsPerPage);

  // Funzione per caricare altri eventi dal server
  const fetchMoreEvents = async () => {
    const newServerPage = serverPage + 1;
    const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
      category
    )}&query=${encodeURIComponent(query)}&limit=10&page=${newServerPage}`;
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
        className="pt-5 animate-slideIn grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8"
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

export default IpNearbyEvents;
