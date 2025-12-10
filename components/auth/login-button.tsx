"use client";

import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import LoginForm from "@/components/auth/login-form";

interface LoginButtonProps {
    children: React.ReactNode;
    mode?: "modal"|"redirect";
    asChild?: boolean;
};

export const LoginButton = ({
    children, mode, asChild
}:LoginButtonProps) => {

    const router = useRouter();
    const onClick = () =>{
        router.push("/auth/login");
    }

    if(mode === "modal"){
        return (
            <Dialog>
                <DialogTitle></DialogTitle>
                <DialogTrigger asChild={asChild}>
                    {children}
                </DialogTrigger>
                <DialogContent className="p-0 w-auto bg-transparent border-none">
                    <LoginForm></LoginForm>
                </DialogContent>
            </Dialog>
        )
    }



    return (
        <span className="cursor-pointer" onClick={onClick}>
            {children}
        </span>
    )
    
}

export default LoginButton;