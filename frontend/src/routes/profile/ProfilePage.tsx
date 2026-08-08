import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuthStore } from "../../shared/stores/authStore";
import { usersService } from "../../modules/users/services/users.service";
import {
  editProfileSchema,
  type EditProfileFormValues,
} from "../../modules/users/schemas/profile.schema";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3 text-center">
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ReadingGoalBar({ booksThisYear, goal }: { booksThisYear: number; goal: number }) {
  const pct = Math.min(100, Math.round((booksThisYear / goal) * 100));
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-background) p-4">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-white font-medium">Reading goal</span>
        <span className="text-gray-400">
          {booksThisYear} / {goal} books
        </span>
      </div>
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

function ProfilePage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", currentUser?.id],
    queryFn: () => usersService.getById(currentUser!.id),
    enabled: Boolean(currentUser?.id),
  });

  const { data: stats } = useQuery({
    queryKey: ["my-stats"],
    queryFn: usersService.getMyStats,
    enabled: Boolean(currentUser?.id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema as never),
    values: profile
      ? {
          displayName: profile.displayName,
          username: profile.username,
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          website: profile.website ?? "",
          favouriteGenres: profile.favouriteGenres.join(", "),
          favouriteAuthors: profile.favouriteAuthors.join(", "),
          readingGoal: profile.readingGoal ?? undefined,
          isPrivateProfile: profile.isPrivateProfile,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", currentUser?.id], updated);
      queryClient.invalidateQueries({ queryKey: ["my-stats"] });
      setIsEditing(false);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: usersService.uploadAvatar,
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", currentUser?.id], updated);
    },
  });

  const onSubmit: SubmitHandler<EditProfileFormValues> = (values) => {
    updateMutation.mutate({
      displayName: values.displayName,
      username: values.username,
      bio: values.bio,
      location: values.location,
      website: values.website,
      favouriteGenres: values.favouriteGenres
        ? values.favouriteGenres
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
        : [],
      favouriteAuthors: values.favouriteAuthors
        ? values.favouriteAuthors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
      readingGoal: values.readingGoal,
      isPrivateProfile: values.isPrivateProfile,
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-gray-400">Loading profile…</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-red-400">Could not load your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-(--color-primary)">My account</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Profile</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: profile card */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.displayName}
                        className="h-16 w-16 rounded-full object-cover ring-4 ring-(--color-border)"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-(--color-primary) flex items-center justify-center text-2xl font-semibold text-white ring-4 ring-(--color-border)">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isEditing && (
                      <label
                        aria-label="Change avatar"
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-(--color-primary) text-xs text-white shadow"
                      >
                        ✎
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{profile.displayName}</h2>
                    <p className="text-sm text-gray-400">@{profile.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) reset();
                    setIsEditing((v) => !v);
                  }}
                  className="rounded-lg border border-(--color-border) px-4 py-1.5 text-sm text-white transition hover:border-(--color-primary)"
                >
                  {isEditing ? "Cancel" : "Edit profile"}
                </button>
              </div>

              {/* View mode */}
              {!isEditing && (
                <div className="space-y-4">
                  {profile.bio && (
                    <p className="text-sm leading-relaxed text-gray-300">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-(--color-primary) hover:underline"
                      >
                        🌐 {profile.website}
                      </a>
                    )}
                  </div>

                  {profile.favouriteGenres.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Genres</p>
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
                    <div>
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

                  <div className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-sm">
                    <span className="text-gray-400">Profile visibility</span>
                    <span
                      className={`font-medium ${profile.isPrivateProfile ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {profile.isPrivateProfile ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Display name</label>
                      <input
                        {...register("displayName")}
                        className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                      />
                      {errors.displayName && (
                        <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Username</label>
                      <input
                        {...register("username")}
                        className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                      />
                      {errors.username && (
                        <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">Bio</label>
                    <textarea
                      {...register("bio")}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                    />
                    {errors.bio && (
                      <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Location</label>
                      <input
                        {...register("location")}
                        className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-300">Website</label>
                      <input
                        {...register("website")}
                        placeholder="https://"
                        className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                      />
                      {errors.website && (
                        <p className="mt-1 text-xs text-red-400">{errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Favourite genres <span className="text-gray-500">(comma-separated)</span>
                    </label>
                    <input
                      {...register("favouriteGenres")}
                      placeholder="Fantasy, Sci-Fi, Mystery"
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Favourite authors <span className="text-gray-500">(comma-separated)</span>
                    </label>
                    <input
                      {...register("favouriteAuthors")}
                      placeholder="Brandon Sanderson, Agatha Christie"
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Reading goal <span className="text-gray-500">(books per year)</span>
                    </label>
                    <input
                      type="number"
                      {...register("readingGoal")}
                      className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-4 py-2.5 text-white focus:border-(--color-primary) focus:outline-none"
                    />
                    {errors.readingGoal && (
                      <p className="mt-1 text-xs text-red-400">{errors.readingGoal.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-300">Private profile</p>
                      <p className="text-xs text-gray-500">Only followers see your activity</p>
                    </div>
                    <input
                      type="checkbox"
                      {...register("isPrivateProfile")}
                      className="h-5 w-5 accent-(--color-primary)"
                    />
                  </div>

                  {updateMutation.isError && (
                    <p className="text-sm text-red-400">
                      Failed to save.{" "}
                      {updateMutation.error instanceof Error
                        ? updateMutation.error.message
                        : "Please try again."}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full rounded-lg bg-(--color-primary) py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save changes"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Right: stats */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5"
            >
              <h3 className="mb-4 text-sm font-semibold text-white">Reading stats</h3>

              {stats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Books completed" value={stats.booksCompleted} />
                    <StatCard label="This year" value={stats.booksThisYear} />
                    <StatCard label="Reviewing" value={stats.reviewsWritten} />
                    <StatCard
                      label="Avg rating"
                      value={stats.averageRating !== null ? `${stats.averageRating}★` : "—"}
                    />
                    <StatCard label="Followers" value={stats.followers} />
                    <StatCard label="Following" value={stats.following} />
                  </div>

                  {profile.readingGoal && profile.readingGoal > 0 && (
                    <ReadingGoalBar
                      booksThisYear={stats.booksThisYear}
                      goal={profile.readingGoal}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-(--color-border)" />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
