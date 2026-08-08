import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { usersService } from "../../modules/users/services/users.service";
import { followsService } from "../../modules/follows/services/follows.service";
import { useAuthStore } from "../../shared/stores/authStore";
import type { ReadingStats } from "../../modules/users/types/user.types";

function Avatar({
  avatar,
  displayName,
  size = "lg",
}: {
  avatar: string | null;
  displayName: string;
  size?: "lg" | "xl";
}) {
  const dim = size === "xl" ? "w-24 h-24 text-3xl" : "w-16 h-16 text-xl";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={displayName}
        className={`${dim} rounded-full object-cover ring-4 ring-(--color-border)`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-(--color-primary) flex items-center justify-center font-semibold text-white ring-4 ring-(--color-border)`}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-600"}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function ReadingGoalProgress({ booksThisYear, goal }: { booksThisYear: number; goal: number }) {
  const pct = Math.min(100, Math.round((booksThisYear / goal) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
        <span>
          {booksThisYear} / {goal} books this year
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-border)">
        <motion.div
          className="h-full rounded-full bg-(--color-primary)"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function StatsSection({ stats, readingGoal }: { stats: ReadingStats; readingGoal: number | null }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Books completed" value={stats.booksCompleted} />
        <StatCard label="Books this year" value={stats.booksThisYear} />
        <StatCard label="Currently reading" value={stats.currentlyReading} />
        <StatCard label="Reviews written" value={stats.reviewsWritten} />
        <StatCard label="Pages read" value={stats.totalPagesRead.toLocaleString()} />
        <StatCard
          label="Avg rating given"
          value={stats.averageRating !== null ? `${stats.averageRating} ★` : "—"}
        />
      </div>
      {readingGoal && readingGoal > 0 && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-4">
          <p className="mb-3 text-sm font-medium text-white">Reading Goal</p>
          <ReadingGoalProgress booksThisYear={stats.booksThisYear} goal={readingGoal} />
        </div>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => usersService.getPublicProfile(username!),
    enabled: Boolean(username),
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followsService.follow(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["public-profile", username] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => followsService.unfollow(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["public-profile", username] }),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-(--color-background) px-4 py-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-32 rounded-2xl bg-(--color-surface)" />
          <div className="h-64 rounded-2xl bg-(--color-surface)" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-white">Reader not found</p>
          <p className="mt-2 text-sm text-gray-400">
            The profile you're looking for doesn't exist.
          </p>
          <Link
            to="/readers"
            className="mt-4 inline-block rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white"
          >
            Discover Readers
          </Link>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const isLoggedIn = Boolean(currentUser);
  const canFollow = isLoggedIn && !profile.isOwnProfile;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  function handleFollowToggle() {
    if (profile.isFollowing) {
      unfollowMutation.mutate(profile.id);
    } else {
      followMutation.mutate(profile.id);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar avatar={profile.avatar} displayName={profile.displayName} size="xl" />
              <div>
                <h1 className="text-2xl font-semibold text-white">{profile.displayName}</h1>
                <p className="text-sm text-gray-400">@{profile.username}</p>
                {profile.location && (
                  <p className="mt-1 text-xs text-gray-500">📍 {profile.location}</p>
                )}
                {profile.createdAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Joined {formatDate(profile.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              {/* Follow counts */}
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <span className="font-semibold text-white">{profile.stats.followers}</span>
                  <span className="ml-1 text-gray-400">followers</span>
                </span>
                <span>
                  <span className="font-semibold text-white">{profile.stats.following}</span>
                  <span className="ml-1 text-gray-400">following</span>
                </span>
              </div>

              {/* Follow / Edit button */}
              {profile.isOwnProfile ? (
                <Link
                  to="/profile"
                  className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-white transition hover:border-(--color-primary)"
                >
                  Edit profile
                </Link>
              ) : canFollow ? (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={isPending}
                  className={`rounded-lg px-5 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    profile.isFollowing
                      ? "border border-(--color-border) text-white hover:border-red-500/50 hover:text-red-400"
                      : "bg-(--color-primary) text-white hover:opacity-90"
                  }`}
                >
                  {isPending ? "..." : profile.isFollowing ? "Unfollow" : "Follow"}
                </button>
              ) : null}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-5 text-sm leading-relaxed text-gray-300">{profile.bio}</p>
          )}

          {/* Genres & Authors */}
          {profile.favouriteGenres.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                Favourite genres
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.favouriteGenres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-(--color-primary)/10 px-3 py-1 text-xs text-(--color-primary)"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.favouriteAuthors.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                Favourite authors
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.favouriteAuthors.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-(--color-border) px-3 py-1 text-xs text-gray-300"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.website && (
            <p className="mt-4 text-xs">
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-(--color-primary) hover:underline"
              >
                {profile.website}
              </a>
            </p>
          )}
        </motion.div>

        {/* Private profile guard */}
        {!profile.isVisible && (
          <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-12 text-center">
            <p className="text-lg font-medium text-white">This profile is private</p>
            <p className="mt-2 text-sm text-gray-400">
              Follow {profile.displayName} to see their reading activity.
            </p>
          </div>
        )}

        {profile.isVisible && (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Reading stats
              </h2>
              <StatsSection stats={profile.stats} readingGoal={profile.readingGoal} />
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Currently reading */}
              {profile.currentlyReading.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
                >
                  <h2 className="mb-4 text-sm font-semibold text-white">Currently reading</h2>
                  <div className="space-y-3">
                    {profile.currentlyReading.map((entry) =>
                      entry.book ? (
                        <Link
                          key={entry.bookId}
                          to={`/books/${entry.bookId}`}
                          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-(--color-background)"
                        >
                          {entry.book.thumbnail ? (
                            <img
                              src={entry.book.thumbnail}
                              alt={entry.book.title}
                              className="h-14 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-14 w-10 shrink-0 rounded bg-(--color-border)" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {entry.book.title}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {entry.book.authors.join(", ")}
                            </p>
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
                      ) : null
                    )}
                  </div>
                </motion.div>
              )}

              {/* Recently finished */}
              {profile.recentlyFinished.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
                >
                  <h2 className="mb-4 text-sm font-semibold text-white">Recently finished</h2>
                  <div className="space-y-3">
                    {profile.recentlyFinished.map((entry) =>
                      entry.book ? (
                        <Link
                          key={entry.bookId}
                          to={`/books/${entry.bookId}`}
                          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-(--color-background)"
                        >
                          {entry.book.thumbnail ? (
                            <img
                              src={entry.book.thumbnail}
                              alt={entry.book.title}
                              className="h-14 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-14 w-10 shrink-0 rounded bg-(--color-border)" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {entry.book.title}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {entry.book.authors.join(", ")}
                            </p>
                            {entry.finishedAt && (
                              <p className="mt-1 text-xs text-gray-600">
                                Finished{" "}
                                {new Date(entry.finishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        </Link>
                      ) : null
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent reviews */}
            {profile.recentReviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
              >
                <h2 className="mb-4 text-sm font-semibold text-white">Recent reviews</h2>
                <div className="space-y-4">
                  {profile.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-(--color-border) bg-(--color-background) p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {review.title && (
                        <p className="mt-2 text-sm font-medium text-white">{review.title}</p>
                      )}
                      <p className="mt-1 line-clamp-3 text-sm text-gray-400">{review.content}</p>
                      <Link
                        to={`/books/${review.bookId}`}
                        className="mt-2 inline-block text-xs text-(--color-primary) hover:underline"
                      >
                        View book →
                      </Link>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Bookshelves */}
            {profile.shelves.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
              >
                <h2 className="mb-4 text-sm font-semibold text-white">Bookshelves</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {profile.shelves.map((shelf) => (
                    <div
                      key={shelf.id}
                      className="rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3"
                    >
                      <p className="text-sm font-medium text-white">
                        {shelf.icon && <span className="mr-1.5">{shelf.icon}</span>}
                        {shelf.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {shelf.bookCount} {shelf.bookCount === 1 ? "book" : "books"}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
