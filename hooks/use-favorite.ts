"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { addFavorite, removeFavorite } from "@/actions/favorites-event";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface UseFavoriteProps {
  eventId: string;
  currentUser?: User | null;
}

export const useFavorite = ({ eventId, currentUser }: UseFavoriteProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  /**
   * `hasFavorited` calcolato sulla base dei dati da server.
   */
  const hasFavoritedFromServer = useMemo(() => {
    // Check if currentUser exists and has favoriteIds property
    if (!currentUser) return false;
    
    // Handle the case where favoriteIds might be undefined or not an array
    const favoriteIds = currentUser.favoriteIds;
    
    // If favoriteIds is undefined or null, we can't determine the state yet
    if (!favoriteIds) return false;
    
    // Ensure we're working with an array and check if it includes the eventId
    return Array.isArray(favoriteIds) && favoriteIds.includes(eventId);
  }, [currentUser, eventId]);

  /**
   * Stato locale per gestire in modo ottimistico l'icona.
   */
  const [isFavorited, setIsFavorited] = useState(hasFavoritedFromServer);

  /**
   * Se `currentUser` o `eventId` cambiano (ad esempio dopo un refresh),
   * risincronizziamo lo stato locale con la verità del server.
   */
  useEffect(() => {
    setIsFavorited(hasFavoritedFromServer);
  }, [hasFavoritedFromServer]);


  /**
   * Funzione per aggiungere/rimuovere preferito.
   */
  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      
      // Se l'utente non è loggato, reindirizziamo alla login.
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      // Se la richiesta è in corso, non facciamo nulla.
      if (isPending) return;

      if (!eventId) {
        toast.error("Invalid event ID");
        return;
      }

      // Passiamo a isPending = true, così da evitare multi-click.
      setIsPending(true);

      // Salviamo il valore precedente per eventuale rollback.
      const wasFavorited = isFavorited;

      // Aggiorniamo la UI in modo ottimistico.
      setIsFavorited(!wasFavorited);

      try {
        let messaggio;

        if (wasFavorited) {
          // L'evento era precedentemente nei preferiti,
          // ora lo stiamo rimuovendo in modo ottimistico.
          if (currentUser?.id) {
            await removeFavorite(eventId, currentUser.id);
            messaggio = "Evento rimosso dai preferiti.";
          }
        } else {
          // L'evento non era nei preferiti,
          // ora lo stiamo aggiungendo in modo ottimistico.
          if (currentUser?.id) {
            await addFavorite(eventId, currentUser.id);
            messaggio = "Evento aggiunto ai preferiti.";
          }
        }

        // Forziamo un refresh (revalidate) di Next.js, per allineare i dati.
        router.refresh();
        toast.success(messaggio || "Operazione completata.");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong.");

        // Se qualcosa è andato storto, facciamo rollback.
        setIsFavorited(wasFavorited);
      } finally {
        setIsPending(false);
      }
    },
    [currentUser, eventId, isFavorited, isPending, router]
  );

  return {
    isFavorited,
    toggleFavorite,
    isPending,
  };
};

export default useFavorite;
