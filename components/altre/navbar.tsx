"use client";


import { ExtendedUser } from "@/next-auth";
import Container from "./container";
import Logo from "./logo";
import Search from "./search";
import UserMenu from "./user-menu";
import { usePathname } from "next/navigation";
import Categories from "./categories";


//la navbar non è responsive per ora (non è lo scopo del tutotrial auth)

interface NavbarProps {
    currentUser?: ExtendedUser | null
}

export const Navbar: React.FC<NavbarProps> = ({
    currentUser
}) => {

    const pathname = usePathname();

    return ( 

    <div className="fixed w-full bg-white z-10 shadow-sm">
    <div className ="py-4 border-b-[1px]">
    <Container>
    <div className="
        flex
        flex-row
        items-center
        justify-between
        gap-3
        md:gap-0
        ">
         <Logo />
         
         {pathname === '/' && (<Search/>)}
         { // crea spazio per schermo responsive anche senza funzionalità ricerca
         pathname !== '/' && (<div className="w-full md:w-auto"> </div>)}
         <UserMenu currentUser={currentUser} />
        </div>
        </Container>
    </div>
     <Categories />

    </div>
    
    );
};


export default Navbar;
       
   