"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import HeartButton from "../altre/heart-button";
import { SafeEvent } from "@/app/types";
import { User } from "@prisma/client";
import DateFormatter from "../altre/date-formatter";
import { FaEdit } from "react-icons/fa";

interface EventCardProps {
  data: SafeEvent & Partial<{ distance: number }>;
  currentUser?: User | null;
  isEventCreator?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ data, currentUser, isEventCreator }) => {

  const router = useRouter();

  const searchParams = useSearchParams();

  // Recuperiamo l'eventuale categoria presente nei parametri
  const currentCategory = searchParams.get("category");
  // Se la categoria corrisponde a quella dell'evento e ci clicchiamo di nuovo,
  // resettiamo andando su "/", altrimenti imposta la categoria.
  const categoryLink =
    currentCategory === data.category ? "/" : `/?category=${data.category}`;

  return (
    <Suspense>
      {/* Contenitore principale: un DIV, non un Link */}
      <div
        className="
          group 
          block 
          overflow-hidden 
          rounded-xl 
          border 
          border-neutral-200 
          shadow-sm
          hover:shadow-md 
          transition-shadow 
          p-4
          bg-white 
          text-neutral-800
        "
      >
        {/* Link per l’evento (immagine + titolo) */}
        <Link href={`/events/${data.id}`}>
          <div
            className="
              relative 
              aspect-square 
              w-full 
              overflow-hidden 
              rounded-lg
              mb-4
            "
          >
            <Image
              alt={data.title}
              src={data.imageSrc || "/images/NERO500.jpg"}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              width={400}
              height={400}
              quality={75}
              priority={false}
              loading="lazy"
            />

         {isEventCreator ? (
        <div className="absolute right-2 top-2 flex flex-col items-center gap-2 transition-all hover:scale-110">
        {/* Pulsante per la modifica */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/events/${data.id}/update/${data.organizationId}`);
          }}
          className="flex items-center justify-center p-3 transition-colors duration-200 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none shadow-md"
          title="Modifica"
        >
          <FaEdit width={20} height={20} />
        </button>
      </div>
      
      ) : (
        <div className="absolute top-3 right-3">
          <HeartButton eventId={data.id} currentUser={currentUser} />
        </div>
      )}
            
          </div>
          <h3 className="text-lg font-semibold mb-1 break-words line-clamp-2">
            {data.title}
          </h3>
        </Link>

        {/* Link per la categoria */}
        <Link
          href={categoryLink}
          className="
            inline-block 
            mb-2 
            px-3 
            py-1 
            rounded-full 
            text-sm 
            font-medium 
            bg-gray-100 
            text-gray-600 
            hover:bg-gray-200
          "
        >
          {data.category}
        </Link>
        <Link href={`/events/${data.id}`}>
        {/* Data evento */}
        <div className="text-sm text-neutral-500 mb-2">
          <DateFormatter dateISO={data.eventDate} showDayName/>
        </div>

       
        {data.distance !== undefined && (
            <div className="text-sm text-gray-500 mt-1">
              Distanza: {data.distance.toFixed(2)} km
            </div>
          )}
        </Link>
        {isEventCreator && (
        <Link href={`/events/${data.id}/ticket-management/${data.organizationId}`}>
          Gestisci Biglietteria
        </Link>
      )}
      </div>
    </Suspense>
  );
};

export default EventCard;
