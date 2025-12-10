"use client"

import { organizationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import {  useForm } from "react-hook-form";
import * as z from "zod";
import { FileUploader } from "@/components/altre/file-uploader";
import { supabase } from "@/lib/supabaseClient";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import italia from "italia";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loader from "../loader";
import { Input } from "@/components/ui/input";
import { createOrganization, updateOrganization } from "@/actions/organization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SafeOrganization } from "@/app/types";



interface OrganizationFormProps {
    userIdprops: string;
    organization?: SafeOrganization
    type: string

  }
  

  export const OrganizationForm = ({ userIdprops, organization, type }: OrganizationFormProps) => {

    const { regioni } = italia;

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const initialRegion = type === "update" && organization?.regione
    ?  organization.regione
    : "";
  
  const initialProvince = type === "update" &&  organization?.provincia
    ?  organization.provincia
    : "";
  
      const [selectedRegion, setSelectedRegion] = useState<string | null>(initialRegion);
      const [selectedProvince, setSelectedProvince] = useState<string | null>(initialProvince);
        const province = useMemo(() => {
          if (!selectedRegion || !regioni) {
              return [];
          }
      
          // Trova la regione corrispondente
          const region = regioni.find((reg: {nome:string}) => reg.nome === selectedRegion);
      
          if (!region) {
             
              return [];
          }
      
          if (!region.province || region.province.length === 0) {
              return [];
          }
      
         
      
          // 🔹 Ritorniamo direttamente le sigle
          return region.province.map((sigla:{sigla:string}) => ({
              nome: sigla, // Nome e sigla saranno uguali
              sigla: sigla
          }));
      }, [selectedRegion, regioni]);
      
      const comuni = useMemo(() => {
        if (!selectedProvince || !italia.comuni || !italia.comuni.regioni) {
            
            return [];
        }
      
      
      
        // 🔹 Troviamo la regione che contiene la provincia selezionata
        const regione = italia.comuni.regioni.find((regione: { province: { code: string; }[]; }) =>
            regione.province.some((prov: { code: string }) => prov.code === selectedProvince)
        );
      
        if (!regione) {
          
            return [];
        }
      
      
      
        // 🔹 Troviamo la provincia dentro la regione usando `code` invece di `sigla`
        const provincia = regione.province.find((prov: { code: string }) => prov.code === selectedProvince);
      
        if (!provincia || !provincia.comuni) {
            return [];
        }
      
        
      
        // 🔹 Restituiamo i comuni trovati
        return provincia.comuni.map((comune: { nome: string }) => ({
            nome: comune.nome,
        }));
      }, [selectedProvince]);
      
  
    const form = useForm<z.infer<typeof organizationSchema>>({
        resolver: zodResolver(organizationSchema),
        defaultValues: 
        organization && type === "update" ? {
          name: organization.name,
          description: organization.description,
          regione: organization.regione || "",
          comune: organization.comune || "",
          provincia: organization.provincia || "",
          // Se imageSrc è null, trasformiamo in undefined
          imageSrc: organization.imageSrc ?? "",
          phone: organization.phone || "",
          email: organization.email || "",
          linkEsterno: organization.linkEsterno || "",
          indirizzo: organization.indirizzo || "",
  
        } : {
          name: "",
          description: "",
          indirizzo: "",
          comune:"",
          provincia: "",
          phone: "",
          regione:"",
          email: "",
          linkEsterno: "",
          imageSrc: ""
        },
      });
      async function handleImageUpload(
        files: File[], 
        defaultImageSrc: string, 
        OrganizationTitle: string
      ): Promise<string> {
        let uploadedImageUrl = defaultImageSrc;
      
        if (files.length > 0) {
          const file = files[0];
      
          // Formattazione della data (giorno-mese-anno)
          const now = new Date();
          const day = String(now.getDate()).padStart(2, "0");
          const month = String(now.getMonth() + 1).padStart(2, "0"); // Mesi 0-based, quindi +1
          const year = now.getFullYear();
      
          // Normalizzazione del titolo evento per evitare problemi nei percorsi
          const sanitizedTitle = OrganizationTitle.replace(/\s+/g, "_").toLowerCase();
      
          // Definizione del percorso fisso del file
          const filePath = `organization/${year}/${month}/${day}/${sanitizedTitle}/cover.jpg`;
      
          // Caricamento su Supabase con sovrascrittura automatica
          const { error: uploadError } = await supabase.storage
            .from("immagini")
            .upload(filePath, file, { upsert: true }); // upsert: true → sovrascrive se già esiste
      
          if (uploadError) {
            console.error("Errore durante il caricamento dell'immagine:", uploadError.message);
            setError("Errore durante il caricamento dell'immagine. Riprova.");
            return uploadedImageUrl;
          }
      
          // Ottieni l'URL pubblico
          const { data } = supabase.storage.from("immagini").getPublicUrl(filePath);
      
          if (!data?.publicUrl) {
            console.error("Errore nel recupero dell'URL pubblico");
            setError("Errore nel recupero dell'URL pubblico.");
            return uploadedImageUrl;
          }
      
          uploadedImageUrl = data.publicUrl;
        }
      
        return uploadedImageUrl;
      }
      
      async function onSubmit(values: z.infer<typeof organizationSchema>) {
        setIsSubmitting(true);
        setError("");
        setSuccess("");
      
        let uploadedImageUrl = await handleImageUpload(files, values.imageSrc || "",values.name);
        if (!uploadedImageUrl) {
          uploadedImageUrl = values.imageSrc || "";
        }
      
        const updatedValues = {
          ...values,
          imageSrc: uploadedImageUrl,
        };
      
      
        if(type === "update" && organization) {
          updateOrganization(organization.id, updatedValues, userIdprops) // Passa userIdprops qui
            .then((data) => {
              if (data.error) {
                setError(data.error);
              }
            })
            .finally(() => {
              setIsSubmitting(false);
            })
            
          } else {
          
          createOrganization(updatedValues, userIdprops) // Passa userIdprops qui
            .then((data) => {
              if (data.error) {
                setError(data.error);
              } else if (data.success) {
                setSuccess(data.success);
                form.reset();
                setFiles([]);
              }
              setIsSubmitting(false);
            })
            .catch((err) => {
              setError("Errore nella creazione dell'organizzazione");
              console.error(err);
              setIsSubmitting(false);
            }); }
       
      }
      
    
      return (
        <>
          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Loader /> {/* Spinner per indicare caricamento */}
            </div>
          )}
    
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci il nome dell'organizzazione"
                          type="text"
                          disabled={isSubmitting}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Descrizione */}
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
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Indirizzo */}
                <FormField
                  control={form.control}
                  name="indirizzo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci l'indirizzo"
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Telefono */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci il numero di telefono"
                          type="text"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci l'email"
                          type="email"
                          disabled={isSubmitting}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Link Esterno */}
                <FormField
                  control={form.control}
                  name="linkEsterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Pubblico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Inserisci un URL"
                          type="url"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Immagine */}
                <FormField
                  control={form.control}
                  name="imageSrc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immagine</FormLabel>
                      <FormControl>
                      <FileUploader 
                         onFieldChange={field.onChange}
                            imageUrl={field.value || ""}
                            setFiles={setFiles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
      <div>
        
      {/* 🔹 SELEZIONE REGIONE */}
      {/* 🔹 REGIONE - Stato Locale (NON parte del form) */}
      <div>
      <FormField
      control={form.control}
      name="regione"
      render={({ field }) => (
    <FormItem>
      <FormLabel>Regione</FormLabel>
      <FormControl>
      <Select
          onValueChange={(val: string) => {
            if (val === "__none") {
              field.onChange(""); // Converte il segnaposto in stringa vuota per il form
              setSelectedRegion("");
              setSelectedProvince("");
            } else {
              field.onChange(val);
              setSelectedRegion(val);
              setSelectedProvince("");
            }
          }}
          // Se il valore del form è vuoto, imposta il valore controllato su "__none"
          value={field.value === "" ? "__none" : field.value}
        >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una Regione" />
            </SelectTrigger>
            <SelectContent>
               {/* Opzione vuota */}
            <SelectItem key="none" value="__none">
              Seleziona una Regione
            </SelectItem>
              {regioni.map((reg: {nome: string}) => (
                <SelectItem key={reg.nome} value={reg.nome}>
                  {reg.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
        </div>


        {/* 🔹 SELEZIONE PROVINCIA */}
        <FormField
  control={form.control}
  name="provincia"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Provincia</FormLabel>
      <FormControl>
        <Select
          onValueChange={(val: string) => {
            field.onChange(val);
            setSelectedProvince(val);
          }}
          value={field.value || ""} // Assicura che il valore non sia undefined
          disabled={!selectedRegion}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona una Provincia" />
          </SelectTrigger>
          <SelectContent>
            {province.map((prov: {sigla:string}) => (
              <SelectItem key={prov.sigla} value={prov.sigla}>
                {prov.sigla}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

             
        {/* 🔹 SELEZIONE COMUNE */}
        <FormField
          control={form.control}
          name="comune"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comune</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProvince ? "Seleziona un Comune" : "Seleziona prima una Provincia"} />
                  </SelectTrigger>
                  <SelectContent>
                  {
                      comuni.map((comune: {nome: string}) => (
                        <SelectItem key={comune.nome} value={comune.nome}>
                          {comune.nome}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>
           
              </div>
             
              {/* Messaggi di Errore e Successo */}
              <FormError message={error} />
              <FormSuccess message={success} />
    
              {/* Pulsante di Submit */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crea Organizzazione"}
              </Button>
            </form>
          </Form>
        </>
      );
    };
    

  export default OrganizationForm;
