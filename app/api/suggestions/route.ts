import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  // Fetch events e organizations contemporaneamente
  const eventsPromise = db.event.findMany({
    where: {
      AND: [
        { title: { contains: query, mode: "insensitive" } },
        { eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } }, // Mostra solo eventi futuri
      ],
    },
    select: { id: true, title: true },
    take: 5,
  });
 

  const organizationsPromise = db.organization.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true },
    take: 5,
  });

  const [events, organizations] = await Promise.all([eventsPromise, organizationsPromise]);

  const eventSuggestions = events.map((event) => ({
    id: event.id,
    name: event.title,
    type: "event",
  }));

  const organizationSuggestions = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    type: "organization",
  }));

  // Combiniamo i risultati – un abbraccio tra tradizione e modernità
  const suggestions = [...eventSuggestions, ...organizationSuggestions];

  return NextResponse.json({ suggestions });
}
