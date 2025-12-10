"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createTicketType, updateTicketType } from "@/actions/ticket-type";
import { CreateTicketTypeSchema, UpdateTicketTypeSchema } from "@/schemas";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import Loader from "../loader";

interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isActive: boolean;
}

interface TicketTypeFormProps {
  eventId: string;
  ticketType?: Omit<TicketType, "createdAt" | "maxPerUser">;
  // Aggiungiamo sold per sapere se limitare i campi
  sold?: number;
  onClose?: () => void;
}

export const TicketTypeForm: React.FC<TicketTypeFormProps> = ({
  eventId,
  ticketType,
  sold = 0,
  onClose,
}) => {
  const isUpdateMode = !!ticketType;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const schema = isUpdateMode ? UpdateTicketTypeSchema : CreateTicketTypeSchema;

  const form = useForm<z.infer<typeof CreateTicketTypeSchema>>({
    resolver: zodResolver(schema),
    defaultValues: isUpdateMode
      ? {
          eventId: ticketType?.eventId || eventId,
          name: ticketType?.name || "",
          description: ticketType?.description || "",
          price: ticketType?.price || 0,
          quantity: ticketType?.quantity || 0,
        }
      : {
          eventId,
          name: "",
          description: "",
          price: 0,
          quantity: 0,
        },
  });

  async function onSubmit(values: z.infer<typeof CreateTicketTypeSchema>) {
    setLoading(true);
    setError(null);

    try {
      if (isUpdateMode && ticketType) {
        // Se sold > 0, aggiorniamo solo quantity
        const result = await updateTicketType(ticketType.id, {
          eventId: ticketType.eventId,
          name: sold > 0 ? ticketType.name : values.name,
          description: sold > 0 ? ticketType.description || "" : values.description,
          price: sold > 0 ? ticketType.price : values.price,
          quantity: values.quantity,
          isActive: ticketType.isActive,
        });
        if (result?.error) {
          toast.error(result.error);
          setLoading(false);
          return;
        }
        toast.success("Biglietto aggiornato con successo!");
      } else {
        // Creazione
        const result = await createTicketType(values);
        if (result?.error) {
          toast.error(result.error);
          setLoading(false);
          return;
        }
        toast.success("Nuovo biglietto creato!");
      }

      router.refresh();
      if (onClose) onClose();
    } catch (err) {
      setError("Errore in fase di salvataggio.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <div className="relative">
        {/* Overlay loader se stiamo salvando */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <Loader />
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-6 bg-gray-100 rounded-lg shadow-md mb-4"
        >
          {error && <p className="text-red-500">{error}</p>}

          {/* Se sold>0 => disabilitiamo nome, descrizione e prezzo */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Biglietto</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Inserisci il nome del biglietto"
                    disabled={loading || (isUpdateMode && sold > 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Inserisci una descrizione"
                    disabled={loading || (isUpdateMode && sold > 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prezzo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    disabled={loading || (isUpdateMode && sold > 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantità</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              disabled={loading}
            >
              {isUpdateMode ? "Aggiorna Biglietto" : "Crea Biglietto"}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Annulla
              </Button>
            )}
          </div>
        </form>
      </div>
    </Form>
  );
};

export default TicketTypeForm;
