import { cache } from 'react';
import { getUserById } from '@/data/user';
import { getEventById, getUpcomingEvents, getNearbyEvents } from '@/data/event';
import { unstable_cache } from "next/cache";

export const getUserByIdCached = cache(getUserById);

export const getEventByIdCached = cache(getEventById);

export const getUpcomingEventsCached = unstable_cache(
  async () => {
    return await getUpcomingEvents();
  },
  ["get_upcoming_events"],
  { revalidate: 60 }
);

export const getNearbyEventsCached = unstable_cache(
  async () => {
    return await getNearbyEvents();
  },
  ["get_nearby_events"],
  { revalidate: 60 }
);
