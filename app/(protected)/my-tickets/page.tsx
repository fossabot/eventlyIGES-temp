import { currentUser } from "@/lib/auth";
import { getTicketsByUser } from "@/data/ticket";
import EmptyState from "@/components/altre/empty-state";
import MyTicketsClient from "@/components/altre/tickets";

export default async function TicketsPage() {
  const user = await currentUser();

  if (!user || !user.id) {
    return (
      <EmptyState 
        title="Accesso Negato" 
        subtitle="Effettua il login per visualizzare i tuoi biglietti." 
      />
    );
  }

  const firstPage = await getTicketsByUser(user.id, 1, 20);

  if (!firstPage || firstPage.length === 0) {
    return (
      <EmptyState 
        title="Nessun Biglietto" 
        subtitle="Non hai ancora acquistato nessun biglietto." 
        showToHome
      />
    );
  }

  return <MyTicketsClient userId={user.id} initialData={firstPage} />;
}
