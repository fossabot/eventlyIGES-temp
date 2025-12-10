// components/events/UpcomingEvents.tsx
"use client";

import { useState } from "react";
import EventList from "@/components/events/events-list";
import ClientPagination from "@/components/altre/pagination";
import { User } from "@prisma/client";
import { SafeEvent } from "@/app/types";
import Link from "next/link";
import { Button } from "../ui/button";

interface UpcomingEventsProps {
  currentUser: User | null;
  events: SafeEvent[]; // eventi già fetchati dal server
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ currentUser, events }) => {
  // --- PAGINAZIONE LATO CLIENT ---
  const [page, setPage] = useState(1);
  const eventsPerPage = 5;

  const startIndex = (page - 1) * eventsPerPage;
  const paginatedEvents = events.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(events.length / eventsPerPage);
  // --- FINE PAGINAZIONE ---

  if (!events.length) {
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
  }

  return (
    <div>
      <div
        key={page}
        className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8"
      >
        <EventList events={paginatedEvents} currentUser={currentUser as User} />
      </div>

      {/* Paginazione lato client */}
      <ClientPagination totalPages={totalPages} page={page} setPage={setPage} />

      {/* Bottone "Vedi Altro" */}
      <div className="flex justify-center mt-4">
        <button
          disabled={page >= totalPages}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md transition ${
            page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          onClick={() => setPage(page + 1)}
        >
          Vedi Altro
        </button>
      </div>
    </div>
  );
};

export default UpcomingEvents;
