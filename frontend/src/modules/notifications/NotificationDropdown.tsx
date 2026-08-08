import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "../../lib/socketClient";
import { useAuthStore } from "../../shared/stores/authStore";
import { notificationsService } from "./notifications.service";
import NotificationItem from "./NotificationItem";
import { getNotificationHref } from "./notification.types";

const unreadCountQueryKey = ["notifications", "unread-count"];
const previewQueryKey = ["notifications", "preview"];

function NotificationBellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M15 17H9m10-4.5V11a7 7 0 10-14 0v1.5L3 15v1h18v-1l-2-1.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotificationDropdown() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCountQuery = useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: Boolean(accessToken),
  });

  const previewQuery = useQuery({
    queryKey: previewQueryKey,
    queryFn: () => notificationsService.list({ page: 1, limit: 5 }),
    enabled: Boolean(accessToken) && isOpen,
  });

  const unreadCount = unreadCountQuery.data ?? 0;
  const previewNotifications = previewQuery.data?.notifications ?? [];

  const socket = useMemo(() => connectSocket(), []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const invalidateNotifications = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const updateCount = (payload: { unreadCount?: number }) => {
      if (typeof payload.unreadCount === "number") {
        queryClient.setQueryData(unreadCountQueryKey, payload.unreadCount);
      }
    };

    socket.on("notification.created", invalidateNotifications);
    socket.on("notification.read", invalidateNotifications);
    socket.on("notification.deleted", invalidateNotifications);
    socket.on("notification.count", updateCount);

    return () => {
      socket.off("notification.created", invalidateNotifications);
      socket.off("notification.read", invalidateNotifications);
      socket.off("notification.deleted", invalidateNotifications);
      socket.off("notification.count", updateCount);
    };
  }, [queryClient, socket]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const handleMarkRead = async (notificationId: string) => {
    await notificationsService.markRead(notificationId);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open notifications"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-white transition hover:border-(--color-primary) hover:bg-(--color-background)"
      >
        <NotificationBellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-(--color-error) px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-50 w-[22rem] overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <p className="text-xs text-gray-400">Latest activity from BookHive</p>
            </div>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-(--color-primary) hover:underline"
            >
              Open page
            </Link>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-3">
            {previewQuery.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-xl bg-(--color-background)"
                  />
                ))}
              </div>
            )}

            {previewQuery.isError && (
              <div className="rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-5 text-sm text-gray-400">
                Could not load notifications.
              </div>
            )}

            {!previewQuery.isLoading && previewNotifications.length === 0 && (
              <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-background) px-4 py-8 text-center text-sm text-gray-400">
                You are all caught up.
              </div>
            )}

            <div className="space-y-3">
              {previewNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  href={getNotificationHref(notification)}
                  compact
                  onMarkRead={() => {
                    void handleMarkRead(notification.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-(--color-border) px-4 py-3">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg border border-(--color-border) px-4 py-2 text-center text-sm font-medium text-white transition hover:border-(--color-primary) hover:bg-(--color-background)"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
