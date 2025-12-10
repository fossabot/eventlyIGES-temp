import {Event, Organization} from "@prisma/client"
import { TicketType } from "@prisma/client";



export type SafeEvent = Omit <
    Event,
    'createdAt' | 'eventDate'
> & {
    createdAt: string;
    eventDate: string;
    ticketTypes?: SafeTicketType[];

}


export type SafeOrganization = Omit <
Organization,
'createdAt' 
> & {
createdAt: string;
}

export type SearchParams = Promise<{
    [key: string]: string | string[] | undefined;
  }>;



  
export type SafeTicketType = Omit<TicketType, "createdAt"> & {
  createdAt: string;
};
