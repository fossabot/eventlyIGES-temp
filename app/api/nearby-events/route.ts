// app/api/nearby-events/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { manualStatus } from "@prisma/client";


function haversineDistance(
  lat1Rad: number, lon1Rad: number, lat2Rad: number, lon2Rad: number
): number {
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const a = sinDLat * sinDLat +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            sinDLon * sinDLon;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Coordinate mancanti" }, { status: 400 });
  }

  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");

  const events = await db.event.findMany({
    where: {
      AND: [
        ...(category ? [{ category }] : []),
        ...(query ? [{ title: { contains: query, mode: "insensitive" as const } }] : []),
        { status: manualStatus.ACTIVE },
      ]
    }
  });

  const eventsWithDistance = events.map((event) => {
    const eventLat = parseFloat(event.latitudine);
    const eventLng = parseFloat(event.longitudine);
    const distance = haversineDistance(lat, lng, eventLat, eventLng);
    return { ...event, distance };
  });

  const radius = 100;
  const filteredEvents = eventsWithDistance.filter((e) => e.distance <= radius);

  filteredEvents.sort((a, b) => a.distance - b.distance);

  const totalEvents = filteredEvents.length;
  const offset = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  const finalEvents = paginatedEvents.map((event) => ({
    ...event,
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));

  return NextResponse.json({
    events: finalEvents,
    pagination: {
      total: totalEvents,
      page,
      limit,
      totalPages: Math.ceil(totalEvents / limit),
    },
  });
}
