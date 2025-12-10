import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/altre/navbar";
import  Footer  from "@/components/footer";
import BottomNavbar from "@/components/bottom-navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();

  
  return (
    
    <SessionProvider session={session}>
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen flex-col">
        <Navbar currentUser={session?.user}/>
        <Toaster/>
        <main className="flex-1 pt-[7rem] md:pt-[9rem] py-4 px-4">{children}</main>
        <div className="sticky bottom-0 z-50">
        <BottomNavbar />
      </div>
        <Footer/>
        
        </div>
        
      </body>
      
    </html>
    </SessionProvider>
  );
}
