"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { settings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ExtendedUser } from "@/next-auth";
import { SettingsSchema } from "@/schemas";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useSession } from "next-auth/react";



interface SettingsFormProps {
    user?: ExtendedUser      //user con il ruolo (Extended user definito nel file next-auth.d.ts)
}

const SettingsForm = ({ user }: SettingsFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  
  const { update } = useSession()

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: "",
      newPassword: ""
    }
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
      .then((data) => {
        if(data.error) {
          setError(data.error);
        }
        if(data.success) {
          update();
          setSuccess(data.success);
        }
      }) 
      .catch(() => setError("Qualcosa è andato storto"));
    });
  }


  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">
          Impostazioni
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
              <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuova Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </>
            
            <Button type="submit" >Aggiorna</Button>
            <FormSuccess message={success} />
            <FormError message={error} />
          </form>
        </Form>
        </div>
      </CardContent>
    </Card>
    
  );
};

export default SettingsForm;
