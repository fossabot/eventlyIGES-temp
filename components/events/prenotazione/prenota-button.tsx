// components/PrenotaOraButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/actions/prenotazioni";


interface PrenotaOraButtonProps {
  eventId: string;
  userId: string;
}

export default function PrenotaOraButton({ eventId, userId }: PrenotaOraButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Chiama la server action per creare la prenotazione
      const { booking } = await createBookingAction(eventId, userId);
      // Reindirizza alla pagina di dettaglio della prenotazione
      router.push(`/prenotazione/${booking.id}`);
    } catch (err) {
      console.error("Errore nella prenotazione", err);
      setError("Errore durante la creazione della prenotazione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Prenotazione in corso..." : "Prenota ora"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
