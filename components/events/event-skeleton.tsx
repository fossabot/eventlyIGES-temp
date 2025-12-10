"use client";

import { Skeleton } from "@/components/ui/skeleton";

const EventSkeleton = () => {
  return (
    <div className="max-w-screen-lg mx-auto p-4">
      {/* Hero section skeleton */}
      <div className="mb-8">
        <Skeleton className="h-[400px] w-full rounded-xl mb-4" />
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
      </div>

      {/* Details section skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-[200px] w-full rounded-lg mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Related events skeleton */}
      <div className="mt-12">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-[150px] w-full rounded-lg mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventSkeleton;