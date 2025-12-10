"use client";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const NewVerificationForm = () => {

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if(!token) {
            setError("Token non valido");
            return;
        };
        newVerification(token)
          .then((data)=> {
            setSuccess(data.success);
            setError(data.error);
          })
          .catch(() => {
            setError("Qualcosa è andato storto");
          })
    },[token])

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (

        <CardWrapper
            headerLabel="Conferma la tua email"
            backButtonHref="/auth/login"
            backButtonLabel="Torna al login"

        >
            <div className="flex items-center w-full justify-center">
               {!success && !error && (
                <BeatLoader />
               )} 
                <FormSuccess message={success} />
                <FormError message={error} />
            </div>
        </CardWrapper>
    );
};