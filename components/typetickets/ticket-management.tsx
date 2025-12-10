"use client";

import React, { useState } from "react";
import TicketTypeForm from "./ticket-form";
import { updateTicketType } from "@/actions/ticket-type";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import Loader from "../loader";

interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
  sold: number;
}

interface TicketManagementProps {
  eventId: string;
  ticketTypes: TicketType[];
}

const TicketManagement: React.FC<TicketManagementProps> = ({ eventId, ticketTypes }) => {
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false); // Per overlay su attiva/disattiva
  const router = useRouter();

  // Toggle isActive
  const handleToggleActive = async (ticket: TicketType) => {
    setLoading(true); // Mostra loader
    try {
      const newActive = !ticket.isActive;
      const result = await updateTicketType(ticket.id, {
        eventId: ticket.eventId,
        name: ticket.name,
        description: ticket.description || "",
        price: ticket.price,
        quantity: ticket.quantity,
        isActive: newActive,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Biglietto "${ticket.name}" aggiornato con successo.`);
        router.refresh();
      }
    } finally {
      setLoading(false); // Nascondi loader
    }
  };

  // Avvia modifica
  const handleEdit = (ticket: TicketType) => {
    // Se è attivo, impediamo la modifica
    if (ticket.isActive) {
      toast(
        `Per poter modificare "${ticket.name}", devi prima disattivarlo.`,
      );
      return;
    }
    // Se ha venduto biglietti, notifichiamo modifica limitata
    if (ticket.sold > 0) {
      toast(
        `Modifica limitata: il biglietto "${ticket.name}" ha già venduto ${ticket.sold} biglietti. Potrai cambiare solo la quantità.`
      );
    }
    setEditingTicket(ticket);
    setIsCreating(false);
  };

  return (
    <div className="relative p-4">
      {/* Overlay globale se stiamo togglando isActive */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <Loader />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h4 className="text-xl font-semibold mb-2 md:mb-0">Gestione Tipi di Biglietto</h4>
        <button
          onClick={() => {
            setEditingTicket(null);
            setIsCreating(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Aggiungi Biglietto
        </button>
      </div>

      {/* Form di creazione */}
      {isCreating && (
        <TicketTypeForm
          eventId={eventId}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Form di modifica */}
      {editingTicket && (
        <TicketTypeForm
          eventId={eventId}
          ticketType={editingTicket}
          sold={editingTicket.sold}
          onClose={() => setEditingTicket(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Descrizione</th>
              <th className="border p-2">Prezzo</th>
              <th className="border p-2">Quantità</th>
              <th className="border p-2">Venduti</th>
              <th className="border p-2">Stato</th>
              <th className="border p-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((ticket) => (
              <tr key={ticket.id}>
                <td className="border p-2">{ticket.name}</td>
                <td className="border p-2">{ticket.description}</td>
                <td className="border p-2">{ticket.price}</td>
                <td className="border p-2">{ticket.quantity}</td>
                <td className="border p-2">{ticket.sold}</td>
                <td className="border p-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticket.isActive}
                      onChange={() => handleToggleActive(ticket)}
                      className="mr-2"
                    />
                    {ticket.isActive ? "Attivo" : "Non attivo"}
                  </label>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(ticket)}
                    className="mr-2 bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Modifica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketManagement;
