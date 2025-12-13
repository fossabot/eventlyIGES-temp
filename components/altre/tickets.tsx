"use client";
import { useState } from "react";
import { getTicketsByUser } from "@/data/ticket";
import TicketList from "@/components/events/ticket/ticket-list";
import { Ticket, Event, TicketType } from "@prisma/client";

type MyTicketsClientProps = {
  userId: string;
  initialData: (Ticket & { event: Event; ticketType: TicketType })[];
};

export default function MyTicketsClient({ userId, initialData }: MyTicketsClientProps) {
  const [tickets, setTickets] = useState(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextPage = page + 1;
    const newTickets = await getTicketsByUser(userId, nextPage, 20);

    if (newTickets.length === 0) {
      setHasMore(false);
    } else {
      setTickets((prev) => [...prev, ...newTickets]);
      setPage(nextPage);
    }

    setLoading(false);
  };

  return (
    <>
      <TicketList tickets={tickets} />
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? "Caricamento..." : "Mostra altri biglietti"}
        </button>
      )}
    </>
  );
}

