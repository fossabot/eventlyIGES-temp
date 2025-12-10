
import { Prenotazione, Event } from "@prisma/client";
import ReservationCard from "./reservation-card";

interface ReservationListProps {
    reservations: (Prenotazione & { event: Event })[];
   
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations }) => {
    return (
        <>
            {reservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation}  />
            ))}
        </>
    );
};

export default ReservationList;
