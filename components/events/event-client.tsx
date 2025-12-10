"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FcCalendar } from "react-icons/fc";
import { CiLocationOn } from "react-icons/ci";
import { FaPen } from "react-icons/fa6";
import HeartButton from "@/components/altre/heart-button";
import Map from "@/components/altre/map";
import DateFormatter from "@/components/altre/date-formatter";
import type { SafeEvent, SafeOrganization } from "@/app/types";
import type { User } from "@prisma/client";

interface EventClientProps {
  event: SafeEvent;
  organization?: SafeOrganization;
  currentUser?: User | null;
  ticketSection?: React.ReactNode;
  organizationSection?: React.ReactNode;
  relatedEventsSection?: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, duration: 0.5 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const EventClient: React.FC<EventClientProps> = ({
  event,
  organization,
  currentUser,
  ticketSection,
  organizationSection,
  relatedEventsSection,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-12 xl:px-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.div
            variants={itemVariants}
            className="relative w-full h-[70vh] rounded-xl overflow-hidden shadow-2xl"
          >
            <Image
              src={event.imageSrc || organization?.imageSrc || "/images/NERO500.jpg"}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              className="object-cover object-center transition-transform duration-700 ease-in-out hover:scale-105"
            />
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <HeartButton eventId={event.id} currentUser={currentUser} />
              <span className="text-white text-sm">{event.favoriteCount}</span>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between bg-white p-8 rounded-xl shadow-xl"
          >
            <div>
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-extrabold text-gray-800 mb-4"
              >
                {event.title}
              </motion.h1>
              {organizationSection && <div className="mt-4">{organizationSection}</div>}
              
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
              >
                <Link
                  href={`/?category=${event.category}`}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-300"
                >
                  {event.category}
                </Link>
              </motion.div>

              {organization && (
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-gray-500 mb-4"
                >
                  Organizzato da {""}
                  <Link
                    href={`/organization/${organization.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {organization.name}
                  </Link>
                </motion.p>
              )}

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-4"
              >
                <FcCalendar size={28} />
                <span className="text-lg text-gray-700">
                  <DateFormatter dateISO={event.eventDate} showDayName={true} />
                </span>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-4"
              >
                <CiLocationOn size={28} />
                <span className="text-lg text-gray-700">
                  {`${event.indirizzo}, ${event.comune}, ${event.provincia}`}
                </span>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <FaPen size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-600">Descrizione Evento</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            </div>

            {ticketSection && <div className="mt-6">{ticketSection}</div>}
          </motion.div>
        </motion.div>

        <Suspense fallback={<div className="mt-12 h-[300px] bg-gray-200 rounded-xl animate-pulse" />}>
          <motion.div variants={itemVariants} className="mt-12 rounded-xl overflow-hidden shadow-lg">
            <Map placeName={`${event.indirizzo}, ${event.comune}, ${organization?.name || ''}`} />
          </motion.div>
        </Suspense>

        {relatedEventsSection && <div className="mt-16">{relatedEventsSection}</div>}
      </div>
    </div>
  );
};

export default EventClient;