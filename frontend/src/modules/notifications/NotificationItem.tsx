import { Link } from "react-router";
import type { Notification } from "./notification.types";

type NotificationItemProps = {
  notification: Notification;
  href?: string | null;
  compact?: boolean;
  onMarkRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
};

function formatTimeAgo(isoDate: string) {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationItem({
  notification,
  href,
  compact = false,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const showActions = !href;

  const content = (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3 transition ${
        notification.read
          ? "border-(--color-border) bg-(--color-background)/40"
          : "border-(--color-primary)/40 bg-(--color-primary)/5"
      } ${compact ? "px-3 py-2" : ""}`}
    >
      <div
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? "bg-gray-600" : "bg-(--color-primary)"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-sm ${notification.read ? "text-gray-300" : "text-white font-medium"}`}
            >
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-400 line-clamp-2">{notification.body}</p>
          </div>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-gray-500">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
          <span className="truncate">{notification.entityType}</span>
          {showActions && (
            <div className="flex items-center gap-2">
              {!notification.read && onMarkRead && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notification)}
                  className="rounded-full border border-(--color-border) px-2.5 py-1 text-gray-300 transition hover:border-(--color-primary) hover:text-white"
                >
                  Mark read
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(notification)}
                  className="rounded-full border border-(--color-border) px-2.5 py-1 text-gray-300 transition hover:border-(--color-error) hover:text-white"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} onClick={() => onMarkRead?.(notification)} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
