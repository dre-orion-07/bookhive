import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { recommendationsService } from "../../modules/recommendations/services/recommendations.service";
import { booksService } from "../../modules/books/services/books.service";
import { libraryService } from "../../modules/library/services/library.service";
import { notificationsService } from "../../modules/notifications/notifications.service";
import { usersService } from "../../modules/users/services/users.service";
import { useAuthStore } from "../../shared/stores/authStore";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

function ReadingGoalWidget({ booksThisYear, goal }: { booksThisYear: number; goal: number }) {
  const pct = Math.min(100, Math.round((booksThisYear / goal) * 100));
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Reading Goal</h3>
        <Link to="/profile" className="text-xs text-(--color-primary) hover:underline">
          Edit
        </Link>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{booksThisYear}</p>
      <p className="text-xs text-gray-500 mb-3">of {goal} books this year</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-border)">
        <motion.div
          className="h-full rounded-full bg-(--color-primary)"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-gray-500">{pct}% of goal</p>
    </div>
  );
}

function ContinueReadingWidget() {
  const { data: history } = useQuery({
    queryKey: ["reading-history", "currently_reading"],
    queryFn: () => libraryService.getHistory(),
  });

  const currentlyReading = (history ?? []).filter((h) => h.status === "currently_reading");

  const bookQueries = useQueries({
    queries: currentlyReading.slice(0, 3).map((entry) => ({
      queryKey: ["books", entry.bookId],
      queryFn: () => booksService.getById(entry.bookId),
    })),
  });

  if (currentlyReading.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) p-5 text-center">
        <p className="text-sm font-medium text-white">Nothing in progress</p>
        <p className="mt-1 text-xs text-gray-500">Start reading a book from your library.</p>
        <Link
          to="/library"
          className="mt-3 inline-block rounded-lg border border-(--color-border) px-4 py-1.5 text-xs font-medium text-white hover:border-(--color-primary) transition"
        >
          Open library
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Continue Reading</h3>
        <Link to="/library" className="text-xs text-(--color-primary) hover:underline">
          Library →
        </Link>
      </div>
      <div className="space-y-3">
        {currentlyReading.slice(0, 3).map((entry, i) => {
          const book = bookQueries[i]?.data;
          return (
            <Link
              key={entry.bookId}
              to={`/books/${entry.bookId}`}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-(--color-background)"
            >
              {book?.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="h-14 w-10 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-14 w-10 shrink-0 rounded bg-(--color-border)" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {book?.title ?? "Loading…"}
                </p>
                <p className="truncate text-xs text-gray-500">{book?.authors.join(", ") ?? ""}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)">
                  <div
                    className="h-full rounded-full bg-(--color-primary)"
                    style={{ width: `${entry.percentComplete}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-gray-600">
                  {entry.percentComplete}% complete
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsWidget() {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsService.getUnreadCount(),
  });

  const unreadCount = data ?? 0;

  return (
    <Link
      to="/notifications"
      className="flex items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 transition hover:border-(--color-primary)/50"
    >
      <div>
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
        <p className="mt-1 text-xs text-gray-500">
          {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-error) text-sm font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function QuickLinks() {
  const links = [
    { to: "/search", label: "🔍 Search books" },
    { to: "/clubs", label: "📚 Book clubs" },
    { to: "/readers", label: "👥 Discover readers" },
    { to: "/bookshelves", label: "🗂 Bookshelves" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-(--color-primary)/50 hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function DashboardPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: recommendationsService.get,
  });

  const { data: stats } = useQuery({
    queryKey: ["my-stats"],
    queryFn: usersService.getMyStats,
    enabled: Boolean(currentUser?.id),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: () => usersService.getById(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const bookQueries = useQueries({
    queries: (recommendations ?? []).map((rec) => ({
      queryKey: ["books", rec.bookId],
      queryFn: () => booksService.getById(rec.bookId),
    })),
  });

  const refreshMutation = useMutation({
    mutationFn: recommendationsService.refresh,
    onSuccess: (data) => queryClient.setQueryData(["recommendations"], data),
  });

  const enrichedRecs = (recommendations ?? []).map((rec, i) => ({
    ...rec,
    book: bookQueries[i]?.data,
  }));

  const firstName = currentUser?.displayName?.split(" ")[0] ?? "reader";

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Greeting */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-(--color-primary)">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">
            Good to see you, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">Ready to discover your next great read?</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Recommendations */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Recommended for you</h2>
                <button
                  type="button"
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="text-xs text-(--color-primary) hover:underline disabled:opacity-50"
                >
                  {refreshMutation.isPending ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              {recsLoading && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="aspect-[2/3] rounded-xl bg-(--color-surface)" />
                      <div className="h-3 w-3/4 rounded bg-(--color-surface)" />
                    </div>
                  ))}
                </div>
              )}

              {!recsLoading && enrichedRecs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-5 py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No recommendations yet.{" "}
                    <Link to="/profile" className="text-(--color-primary) hover:underline">
                      Set your favourite genres
                    </Link>{" "}
                    to get personalised picks.
                  </p>
                </div>
              )}

              {enrichedRecs.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {enrichedRecs.slice(0, 8).map((rec) =>
                    rec.book ? (
                      <Link
                        key={rec.id}
                        to={`/books/${rec.bookId}`}
                        className="group flex flex-col gap-2"
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
                          {rec.book.thumbnail ? (
                            <img
                              src={rec.book.thumbnail}
                              alt={rec.book.title}
                              className="h-full w-full object-cover transition group-hover:opacity-80"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-600 p-2 text-center">
                              No cover
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="line-clamp-2 text-sm font-medium text-white">
                            {rec.book.title}
                          </p>
                          {rec.reason && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-(--color-primary)">
                              {rec.reason}
                            </p>
                          )}
                        </div>
                      </Link>
                    ) : null
                  )}
                </div>
              )}
            </motion.div>

            {/* Continue reading */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <ContinueReadingWidget />
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            {stats && (
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                {profile?.readingGoal && profile.readingGoal > 0 ? (
                  <ReadingGoalWidget
                    booksThisYear={stats.booksThisYear}
                    goal={profile.readingGoal}
                  />
                ) : (
                  <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
                    <h3 className="mb-3 text-sm font-semibold text-white">Reading stats</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Completed", value: stats.booksCompleted },
                        { label: "This year", value: stats.booksThisYear },
                        { label: "Reading", value: stats.currentlyReading },
                        { label: "Reviews", value: stats.reviewsWritten },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-(--color-border) bg-(--color-background) p-3 text-center"
                        >
                          <p className="text-xl font-semibold text-white">{s.value}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/profile"
                      className="mt-3 block text-center text-xs text-(--color-primary) hover:underline"
                    >
                      Set a reading goal →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* Notifications */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <NotificationsWidget />
            </motion.div>

            {/* Quick links */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <QuickLinks />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
