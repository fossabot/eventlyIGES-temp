"use client";

import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {NewPasswordSchema} from "@/schemas"

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";

import { useSearchParams } from "next/navigation";


import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage

    
} from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState, useTransition } from "react";
import { newPassword } from "@/actions/new-password";


export const NewPasswordForm = () => {

    const searchParams = useSearchParams();

    const token = searchParams.get("token")

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: ""  
        }
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

         startTransition(() => {
            newPassword(values, token)
            .then((data) => {
                setError(data?.error);
                setSuccess(data?.success);
            });
        }); 
    }

    return(
        <CardWrapper 
        headerLabel="Inserisci la nuova password"
        backButtonLabel="Torna al login"
        backButtonHref="/auth/login"
        > 
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    
                    <div className="space-y-4">
                    <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} 
                                        placeholder="******"
                                        type="password" 
                                        disabled={isPending}/>
                                    </FormControl>
                                   
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit"
                        className="w-full"
                        disabled={isPending}>
                            Reimposta la password
                        </Button>
                    </div>      
                </form>
            </Form> 
        </CardWrapper>
)
}  

export default NewPasswordForm;