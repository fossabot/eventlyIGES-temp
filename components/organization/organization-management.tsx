// components/OrgnizationManagement.tsx

"use client";

import React from "react";

import { SafeOrganization } from "@/app/types";
import Link from "next/link";
import OrganizationTicketingStatus from "./organization-ticketing-status";

interface OrgnizationManagementProps {
  organization: SafeOrganization;
}

const OrgnizationManagement: React.FC<OrgnizationManagementProps> = ({  organization}) => {
  return (
    <>
    <Link href={`/events/crea/${organization.id}`}>
      Crea Evento
    </Link>
    
    <OrganizationTicketingStatus ticketingStatus={organization.ticketingStatus} />
    </>
  );
};

export default OrgnizationManagement;
