import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followsService } from "../../modules/follows/services/follows.service";
import { useAuthStore } from "../../shared/stores/authStore";

function DiscoverReadersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const { data: readers, isLoading } = useQuery({
    queryKey: ["discover-readers"],
    queryFn: followsService.discoverReaders,
    enabled: !!currentUser,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followsService.follow(userId),
    onSuccess: (_, userId) => {
      setFollowedIds((prev) => new Set(prev).add(userId));
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-sans font-semibold text-white mb-1">Discover Readers</h1>
        <p className="text-gray-400 mb-6">Find people who share your reading taste</p>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-(--color-surface) animate-pulse" />
            ))}
          </div>
        )}

        {readers && readers.length === 0 && (
          <p className="text-gray-400">
            No matching readers found yet. Set your favourite genres and authors in your{" "}
            <a href="/profile" className="text-(--color-primary) hover:underline">
              profile
            </a>{" "}
            to find people with similar taste.
          </p>
        )}

        {readers && readers.length > 0 && (
          <div className="space-y-3">
            {readers.map((reader) => (
              <div
                key={reader.id}
                className="flex items-center justify-between bg-(--color-surface) border border-(--color-border) rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {reader.avatar ? (
                    <img
                      src={reader.avatar}
                      alt={reader.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-(--color-primary) flex items-center justify-center text-white font-semibold">
                      {reader.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{reader.displayName}</p>
                    <p className="text-xs text-gray-400">@{reader.username}</p>
                    {reader.sharedGenres.length > 0 && (
                      <p className="text-xs text-(--color-primary) mt-1">
                        Shares your interest in {reader.sharedGenres.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => followMutation.mutate(reader.id)}
                  disabled={followedIds.has(reader.id) || followMutation.isPending}
                  className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition"
                >
                  {followedIds.has(reader.id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscoverReadersPage;
