"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { LuTickets } from "react-icons/lu";

const BottomNavbar = () => {
  const pathname = usePathname(); // Ottiene il percorso attuale

  const navItems = [
    { href: "/", icon: <FaHome className="w-6 h-6" />, label: "Home" },
    { href: "/my-favorites", icon: <CiHeart className="w-6 h-6" />, label: "Preferiti" },
    { href: "/my-reservations", icon: <LuTickets className="w-6 h-6" />, label: "Prenotazioni" },

  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-5 ${
                isActive ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {React.cloneElement(item.icon, {
                className: `w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-500"}`,
              })}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
