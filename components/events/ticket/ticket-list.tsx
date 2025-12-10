import { Ticket, Event, TicketType } from "@prisma/client";
import TicketCard from "./ticket-card";


interface TicketListProps {
    tickets: (Ticket & { event: Event; ticketType: TicketType })[];
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
    return (
        <>
            {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </>
    );
};

export default TicketList;
