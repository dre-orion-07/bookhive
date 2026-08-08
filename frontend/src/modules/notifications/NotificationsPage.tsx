import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import NotificationItem from "./NotificationItem";
import { notificationsService } from "./notifications.service";

function NotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications", "page"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => notificationsService.list({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const pages = notificationsQuery.data?.pages ?? [];
  const notifications = pages.flatMap((page) => page.notifications);
  const unreadCount = pages[0]?.unreadCount ?? 0;

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteMutation.mutate(notificationId);
  };

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-(--color-primary)">
              Activity feed
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Notifications</h1>
            <p className="mt-2 text-sm text-gray-400">
              Stay on top of your reading, club, and social activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-white transition hover:border-(--color-primary)"
            >
              Back to dashboard
            </Link>
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              disabled={unreadCount === 0 || markAllMutation.isPending}
              className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markAllMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          </div>
        </div>

        {notificationsQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-(--color-surface)" />
            ))}
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-8 text-center text-sm text-gray-400">
            Could not load notifications right now.
          </div>
        )}

        {!notificationsQuery.isLoading &&
          notifications.length === 0 &&
          !notificationsQuery.isError && (
            <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-5 py-14 text-center">
              <p className="text-lg font-medium text-white">No notifications yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Activity from messages, clubs, and follows will appear here.
              </p>
            </div>
          )}

        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(item) => handleMarkRead(item.id)}
              onDelete={(item) => handleDelete(item.id)}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={() => notificationsQuery.fetchNextPage()}
            disabled={!notificationsQuery.hasNextPage || notificationsQuery.isFetchingNextPage}
            className="rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2 text-sm font-medium text-white transition hover:border-(--color-primary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {notificationsQuery.isFetchingNextPage
              ? "Loading more..."
              : notificationsQuery.hasNextPage
                ? "Load more"
                : "No more notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
