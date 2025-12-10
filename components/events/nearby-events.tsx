"use client";

import { useState } from "react";
import EventList from "@/components/events/events-list";
import { User } from "@prisma/client";
import ClientPagination from "@/components/altre/pagination";
import { SafeEvent } from "@/app/types";

interface NearbyEventsProps {
  currentUser: User | null;
  events: SafeEvent[]; // aggiunto
}

const NearbyEvents: React.FC<NearbyEventsProps> = ({ currentUser, events }) => {
  const [page, setPage] = useState(1);
  const eventsPerPage = 5;

  const startIndex = (page - 1) * eventsPerPage;
  const paginatedEvents = events.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  if (!events.length) {
    return <div>Nessun evento vicino trovato.</div>;
  }

  return (
    <div>
      <div key={page} className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <EventList events={paginatedEvents} currentUser={currentUser as User} />
      </div>

      <ClientPagination totalPages={totalPages} page={page} setPage={setPage} />

      <div className="flex justify-center mt-4">
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
            page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          Vedi Altro
        </button>
      </div>
    </div>
  );
};

export default NearbyEvents;
