"use client";

import { useState, useMemo } from "react";
import { useForm, Control, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker, MobileTimePicker } from "@mui/x-date-pickers";
import * as z from "zod";
import dayjs from "dayjs";
import "dayjs/locale/it";

import { CreateEventSchema } from "@/schemas";
import { createEvent, updateEvent } from "@/actions/event";
import { SafeEvent, SafeOrganization } from "@/app/types";
import { FileUploader } from "@/components/altre/file-uploader";
import Loader from "../loader";
import { supabase } from "@/lib/supabaseClient";
import italia from "italia";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

dayjs.locale("it");

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function SimpleInput({ label, ...props }: SimpleInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">{label}</label>
      <input {...props} className="border rounded-md p-2" />
    </div>
  );
}

interface SimpleSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function SimpleSelect({ label, options, value, onChange, disabled }: SimpleSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border rounded-md p-2"
      >
        <option value="">Seleziona...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateTimePicker({ control }: { control: Control<z.infer<typeof CreateEventSchema>> }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
      <div className="grid grid-cols-2 gap-6">
        <Controller
          name="eventDateDay"
          control={control}
          render={({ field }) => (
            <MobileDatePicker
              label="Data"
              value={field.value ? dayjs(field.value) : null}
              onChange={(v) => field.onChange(v?.toDate())}
              className="w-full border rounded-md"
            />
          )}
        />
        <Controller
          name="eventTime"
          control={control}
          render={({ field }) => (
            <MobileTimePicker
              label="Orario"
              value={field.value ? dayjs(field.value) : null}
              onChange={(v) => field.onChange(v?.toDate())}
              ampm={false}
              minutesStep={5}
              className="w-full border rounded-md"
            />
          )}
        />
      </div>
    </LocalizationProvider>
  );
}

interface EventFormProps {
  organization: SafeOrganization;
  type: "create" | "update";
  event?: SafeEvent;
}

export const EventForm = ({ organization, type, event }: EventFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { regioni } = italia;

  const nowplusone = new Date();
  nowplusone.setMinutes(0, 0, 0);
  nowplusone.setDate(nowplusone.getDate() + 1);

  const initialRegion = event?.regione || organization.regione || "";
  const initialProvince = event?.provincia || organization.provincia || "";
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);

  interface Regione {
    nome: string;
    province?: (string | { sigla: string })[];
  }

  const provinceOptions = useMemo(() => {
    if (!selectedRegion) return [];
    const region = regioni.find((r: Regione) => r.nome === selectedRegion);
    return region?.province?.map((p: string | { sigla: string }) =>
      typeof p === "string" ? p : p.sigla
    ) || [];
  }, [selectedRegion, regioni]);

  interface Provincia {
    code: string;
    comuni?: { nome: string }[];
  }

  interface RegioneComuni {
    province: Provincia[];
  }

  const comuneOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const regione = italia.comuni.regioni.find((r: RegioneComuni) =>
      r.province.some((prov: Provincia) => prov.code === selectedProvince)
    );
    const provincia = regione?.province.find((prov: Provincia) => prov.code === selectedProvince);
    return provincia?.comuni?.map((c: { nome: string }) => c.nome) || [];
  }, [selectedProvince]);

  const defaultValues: z.infer<typeof CreateEventSchema> = {
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "",
    comune: event?.comune || "",
    provincia: event?.provincia || organization.provincia || "",
    regione: event?.regione || organization.regione || "",
    eventDate: event?.eventDate ? new Date(event.eventDate) : nowplusone,
    eventDateDay: event?.eventDate ? new Date(event.eventDate) : nowplusone,
    eventTime: event?.eventDate ? new Date(event.eventDate) : nowplusone,
    indirizzo: event?.indirizzo || organization.indirizzo || "",
    organizationId: organization.id,
    status: event?.status === "ACTIVE" ? "pubblico" : "pubblico",
    isReservationActive: event?.isReservationActive ?? true,
    imageSrc: event?.imageSrc || "",
  };

  const form = useForm<z.infer<typeof CreateEventSchema>>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues,
  });

  const handleEventDateTime = (date: Date, time: Date) => {
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    combined.setHours(time.getHours(), time.getMinutes(), 0);
    return combined;
  };

  const handleImageUpload = async (files: File[], defaultImageSrc: string, eventTitle: string) => {
    const uploadedImageUrl = defaultImageSrc;
    if (!files.length) return uploadedImageUrl;

    const file = files[0];
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const sanitizedTitle = eventTitle.replace(/\s+/g, "_").toLowerCase();
    const filePath = `events/${year}/${month}/${day}/${sanitizedTitle}/cover.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("immagini")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError.message);
      setError("Errore durante il caricamento dell'immagine. Riprova.");
      return uploadedImageUrl;
    }

    const { data } = supabase.storage.from("immagini").getPublicUrl(filePath);
    if (!data?.publicUrl) {
      setError("Errore nel recupero dell'URL pubblico.");
      return uploadedImageUrl;
    }

    return data.publicUrl;
  };

  const onSubmit: SubmitHandler<z.infer<typeof CreateEventSchema>> = async (values) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const uploadedImageUrl = await handleImageUpload(files, values.imageSrc || "", values.title);
    const combinedDateTime = handleEventDateTime(values.eventDateDay, values.eventTime);

    const updatedValues = { ...values, eventDate: combinedDateTime, imageSrc: uploadedImageUrl };

    try {
      if (type === "update" && event) {
        const res = await updateEvent(event.id, updatedValues);
        if (res.error) setError(res.error);
        else setSuccess("Evento aggiornato con successo!");
      } else {
        const res = await createEvent(updatedValues);
        if (res.error) setError(res.error);
        else setSuccess("Evento creato con successo!");
      }
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore durante il salvataggio dell'evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleInput label="Titolo" {...form.register("title")} disabled={isSubmitting} />
          <SimpleSelect
            label="Categoria"
            options={[]}
            value={form.getValues("category")}
            onChange={(v) => form.setValue("category", v)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploader
            setFiles={setFiles}
            imageUrl={form.getValues("imageSrc") || ""}
            onFieldChange={(value: string) => form.setValue("imageSrc", value)}
          />
          <SimpleInput label="Indirizzo" {...form.register("indirizzo")} disabled={isSubmitting} />
        </div>

        <SimpleInput label="Descrizione" {...form.register("description")} disabled={isSubmitting} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center gap-3">
            <Checkbox
              checked={form.getValues("isReservationActive")}
              onCheckedChange={(v) => form.setValue("isReservationActive", Boolean(v))}
            />
            Prenotazione evento disponibile
          </label>
          <SimpleSelect
            label="Stato"
            options={["pubblico", "privato"]}
            value={form.getValues("status")}
            onChange={(v) => form.setValue("status", v as "pubblico" | "privato")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleSelect
            label="Regione"
            options={regioni.map((r: { nome: string }) => r.nome)}
            value={selectedRegion}
            onChange={(v) => {
              setSelectedRegion(v);
              setSelectedProvince("");
            }}
          />
          <SimpleSelect
            label="Provincia"
            options={provinceOptions}
            value={selectedProvince}
            onChange={setSelectedProvince}
          />
        </div>

        <SimpleSelect
          label="Comune"
          options={comuneOptions}
          value={form.getValues("comune")}
          onChange={(v) => form.setValue("comune", v)}
        />

        <DateTimePicker control={form.control} />

        <FormError message={error} />
        <FormSuccess message={success} />

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
          {type === "update" ? "Aggiorna evento" : "Crea evento"}
        </Button>
      </form>
    </>
  );
};

export default EventForm;
