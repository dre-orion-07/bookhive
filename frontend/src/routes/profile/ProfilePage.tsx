import { useState, type ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../shared/stores/authStore";
import { usersService } from "../../modules/users/services/users.service";
import {
  editProfileSchema,
  type EditProfileFormValues,
} from "../../modules/users/schemas/profile.schema";

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
    enabled: !!currentUser?.id,
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
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          website: profile.website ?? "",
          favouriteGenres: profile.favouriteGenres.join(", "),
          readingGoal: profile.readingGoal ?? undefined,
          isPrivateProfile: profile.isPrivateProfile,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", currentUser?.id], updated);
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
      bio: values.bio,
      location: values.location,
      website: values.website,
      favouriteGenres: values.favouriteGenres
        ? values.favouriteGenres
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
        : [],
      readingGoal: values.readingGoal,
      isPrivateProfile: values.isPrivateProfile,
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      avatarMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-gray-400 font-sans">Loading profile...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-red-400 font-sans">Could not load your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-2xl mx-auto bg-(--color-surface) border border-(--color-border) rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center text-white text-xl font-semibold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <label className="absolute -bottom-1 -right-1 bg-(--color-primary) rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer">
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
              <h1 className="text-xl font-sans font-semibold text-white">{profile.displayName}</h1>
              <p className="text-sm text-gray-400">@{profile.username}</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditing) reset();
              setIsEditing(!isEditing);
            }}
            className="text-sm text-(--color-primary) hover:underline"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Display Name</label>
              <input
                {...register("displayName")}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Bio</label>
              <textarea
                {...register("bio")}
                rows={3}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
              {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Location</label>
              <input
                {...register("location")}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Website</label>
              <input
                {...register("website")}
                placeholder="https://"
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-400">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Favourite Genres (comma-separated)
              </label>
              <input
                {...register("favouriteGenres")}
                placeholder="Fantasy, Sci-Fi, Mystery"
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Reading Goal (books/year)</label>
              <input
                type="number"
                {...register("readingGoal")}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-4 py-2.5 text-white focus:outline-none focus:border-(--color-primary)"
              />
              {errors.readingGoal && (
                <p className="mt-1 text-xs text-red-400">{errors.readingGoal.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm text-gray-300">Private Profile</label>
                <p className="text-xs text-gray-500">
                  Only followers can see your activity and library
                </p>
              </div>
              <input
                type="checkbox"
                {...register("isPrivateProfile")}
                className="w-5 h-5 accent-(--color-primary)"
              />
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 transition"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <>
            {profile.bio && <p className="text-gray-300 text-sm mb-6">{profile.bio}</p>}

            {profile.favouriteGenres.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Top Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.favouriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.readingGoal && (
              <div className="mt-6 pt-6 border-t border-(--color-border)">
                <p className="text-sm text-gray-400">
                  Reading goal: <span className="text-white">{profile.readingGoal} books</span> this
                  year
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
