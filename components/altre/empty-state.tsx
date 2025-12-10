'use client'

import { Button } from "@/components/ui/button";
import { Header } from "@/components/auth/header";
import Link from "next/link";

interface EmptyState {
    title?: string,
    subtitle?: string;
    showReset?: boolean;
    showToHome?: boolean;
}
 
const EmptyState:React.FC<EmptyState> = ({
    title = "Nessun risultato trovato",
    subtitle = "Prova a modificare i filtri di ricerca",
    showReset,
    showToHome

}) => {


    return (
        <div className="
            h-[60vh]
            flex
            flex-col
            gap-2
            justify-center
            items-center
        ">
            <Header 
            title={title}
            subtitle={subtitle}
            center
            />
            <div className="w-48 mt-4 text-center">
                {showReset && (
                    <Link href="/">
                    <Button 
                    variant={"outline"}
                    size={"lg"}
                >
                    Rimuovi i filtri
                </Button>
                </Link>
                )}
                 {showToHome && (
                    <Link href="/">
                    <Button 
                    variant={"outline"}
                    size={"lg"}
                >
                    Vai alla Home
                </Button>
                </Link>
                )}
            </div>
        </div>
    )
}

export default EmptyState;