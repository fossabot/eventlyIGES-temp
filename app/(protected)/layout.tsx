"use client";

import { Suspense } from 'react';
import Loading from '../loading';



export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 



  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Suspense fallback={<Loading/>}>
          <main>
            {children}
          </main>
        </Suspense>
      </div>
     
    </div>
  );
}
