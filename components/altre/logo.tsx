'use client';

import Image from "next/image";
import Link from "next/link";

const Logo = () =>{
   

    
    return (
      <Link href="/">
        <Image
        alt="logo"
        className="hidden md:block cursor-pointer"
        height="150"
        width="150"
        src ="/images/evently-logo.png"
        />
        </Link>
    )
  }

export default Logo;