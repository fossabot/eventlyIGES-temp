import { Prenotazione, Event } from "@prisma/client";
import Link from "next/link";

interface ReservationCardProps {
    reservation: Prenotazione & { event: Event };
    
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
    return (
        <div className="border rounded-lg p-4 shadow-md">
            <h4 className="text-lg font-bold">{reservation.event.title}</h4>
            <p className="text-sm text-gray-600">{new Date(reservation.event.eventDate).toLocaleDateString()}</p>
            <Link href={`/prenotazione/${reservation.id}`} className="text-blue-600 hover:underline">
                Vedi evento
            </Link>
        </div>
    );
};

export default ReservationCard;
