import { Ticket, Event, TicketType } from "@prisma/client";
import Link from "next/link";

interface TicketCardProps {
    ticket: Ticket & { event: Event; ticketType: TicketType };
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    return (
        <div className="border rounded-lg p-4 shadow-md">
            <h4 className="text-lg font-bold">{ticket.event.title}</h4>
            <p className="text-sm text-gray-600">
                Data: {new Date(ticket.event.eventDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
                Tipo biglietto: {ticket.ticketType.name} - €{(ticket.paid / 100).toFixed(2)}
            </p>
            <p className={`text-sm font-semibold ${ticket.isValid ? "text-green-600" : "text-red-600"}`}>
                {ticket.isValid ? "Valido" : "Non valido"}
            </p>
            <Link href={`/ticket/${ticket.id}`} className="text-blue-600 hover:underline">
                Vedi biglietto
            </Link>
        </div>
    );
};

export default TicketCard;
