// components/altre/Notification.tsx
"use client";

import { useState, useEffect } from "react";
import { UserNotificationItem, getUserNotifications } from "@/data/notification";
import Loading from "@/app/loading";

type NotificationsClientProps = {
  initialData: UserNotificationItem[];
  userId: string;
};

export default function NotificationsClient({
  initialData,
  userId,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<UserNotificationItem[]>(initialData);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    async function loadMore() {
      if (!hasMore || loading) return;

      setLoading(true);
      const nextPage = page + 1;
      const newNotifications = await getUserNotifications(userId, nextPage, 20);

      if (newNotifications.length === 0) {
        setHasMore(false);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
        setPage(nextPage);
      }
      setLoading(false);
    }

    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading, userId]);

  if (!notifications.length) return <p>Nessuna notifica disponibile</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pt-5">
      {notifications.map((n) => (
        <article key={n.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="text-base font-semibold">{n.title}</h4>
          <p className="mt-1 text-sm text-gray-700">{n.message}</p>
          {n.link && (
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm underline"
            >
              Apri
            </a>
          )}
          <time
            className="mt-2 block text-xs text-gray-500"
            dateTime={n.createdAt.toISOString()}
          >
            {n.createdAt.toLocaleString("it-IT")}
          </time>
        </article>
      ))}
      {loading && <Loading />}
    </div>
  );
}
