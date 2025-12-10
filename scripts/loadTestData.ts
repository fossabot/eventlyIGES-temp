import { db } from "../lib/db";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("Starting bulk data insertion...");

  // Utenti
  const usersData = Array.from({ length: 100 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: "12345678",
    role: "USER" as const,
    favoriteIds: [],
  }));

  const users = await db.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });
  console.log(`Inserted ${usersData.length} users`);

  // Organizzazioni
  const orgsData = Array.from({ length: 10 }, () => ({
    name: faker.company.name(),
    email: faker.internet.email(),
    description: faker.lorem.sentence(),
  }));

  const orgs = await Promise.all(
    orgsData.map((o) => db.organization.create({ data: o }))
  );
  console.log(`Inserted ${orgs.length} organizations`);

  // Eventi
  const eventsData = Array.from({ length: 50 }, () => ({
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement(["Concerti", "Teatro", "Sport"]),
    comune: faker.location.city(),
    provincia: faker.location.state(),
    regione: faker.location.state(),
    latitudine: faker.location.latitude(),
    longitudine: faker.location.longitude(),
    eventDate: faker.date.future(),
    indirizzo: faker.location.streetAddress(),
    organizationId: faker.helpers.arrayElement(orgs).id,
    status: "ACTIVE" as const,
    isReservationActive: true,
  }));

  const events = await Promise.all(
    eventsData.map((e) =>
      db.event.create({
        data: {
          ...e,
          latitudine: e.latitudine.toString(),
          longitudine: e.longitudine.toString(),
        },
      })
    )
  );
  console.log(`Inserted ${events.length} events`);


  // TicketType
  const ticketTypesData = events.flatMap((event) => [
    {
      name: "VIP",
      price: 10000,
      quantity: 50,
      eventId: event.id,
    },
    {
      name: "Standard",
      price: 5000,
      quantity: 100,
      eventId: event.id,
    },
  ]);

  await db.ticketType.createMany({ data: ticketTypesData });
  console.log(`Inserted ${ticketTypesData.length} ticket types`);

  console.log("Bulk data insertion completed.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => db.$disconnect());
