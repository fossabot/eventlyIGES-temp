"use client";

import { SafeTicketType } from "@/app/types";
import { useState } from "react";

interface TicketRowProps {
  typeTicket: SafeTicketType
  userId: string;
  className?: string;
}

export default function TicketRow({ typeTicket, userId, className = "" }: TicketRowProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!userId) {
      alert("Devi essere loggato per acquistare un biglietto.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ ticketId: typeTicket.id, userId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Errore nel checkout: " + data.error);
      }
    } catch (error) {
      console.error("Errore durante il checkout:", error);
      alert("Errore imprevisto durante il checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex justify-between items-center p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white ${className}`}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{typeTicket.name}</h3>
        {typeTicket.description && (
          <p className="text-sm text-gray-600 mt-1">{typeTicket.description}</p>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <p className="text-green-600 font-bold text-xl">€ {typeTicket.price.toFixed(2)}</p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center min-w-[140px]"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Attendi...
            </span>
          ) : (
            `Acquista`
          )}
        </button>
      </div>
    </div>
  );
}
