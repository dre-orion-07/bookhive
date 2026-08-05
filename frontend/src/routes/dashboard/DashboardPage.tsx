import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { Link } from "react-router";
import { recommendationsService } from "../../modules/recommendations/services/recommendations.service";
import { booksService } from "../../modules/books/services/books.service";
import { useAuthStore } from "../../shared/stores/authStore";

function DashboardPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: recommendationsService.get,
  });

  const bookQueries = useQueries({
    queries: (recommendations ?? []).map((rec) => ({
      queryKey: ["books", rec.bookId],
      queryFn: () => booksService.getById(rec.bookId),
    })),
  });

  const refreshMutation = useMutation({
    mutationFn: recommendationsService.refresh,
    onSuccess: (data) => {
      queryClient.setQueryData(["recommendations"], data);
    },
  });

  const enrichedRecommendations = (recommendations ?? []).map((rec, index) => ({
    ...rec,
    book: bookQueries[index]?.data,
  }));

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-sans font-semibold text-white">
            Good to see you, {currentUser?.displayName?.split(" ")[0] ?? "reader"} 👋
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Ready to discover your next great read?</p>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-sans font-semibold text-white">AI Recommendations For You</h2>
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="text-sm text-(--color-primary) hover:underline disabled:opacity-50"
          >
            {refreshMutation.isPending ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-[2/3] rounded-lg bg-(--color-surface) border border-(--color-border)" />
                <div className="h-4 w-full rounded bg-(--color-surface)" />
              </div>
            ))}
          </div>
        )}

        {recommendations && recommendations.length === 0 && (
          <p className="text-gray-400">
            No recommendations yet.{" "}
            <Link to="/profile" className="text-(--color-primary) hover:underline">
              Set your favourite genres
            </Link>{" "}
            to get personalized picks.
          </p>
        )}

        {enrichedRecommendations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {enrichedRecommendations.map((rec) =>
              rec.book ? (
                <Link
                  key={rec.id}
                  to={`/books/${rec.bookId}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-(--color-surface) border border-(--color-border) relative">
                    {rec.book.thumbnail ? (
                      <img
                        src={rec.book.thumbnail}
                        alt={rec.book.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                        No cover
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium line-clamp-2">{rec.book.title}</p>
                    {rec.reason && (
                      <p className="text-xs text-(--color-primary) line-clamp-2 mt-1">
                        {rec.reason}
                      </p>
                    )}
                  </div>
                </Link>
              ) : null
            )}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-(--color-border)">
          <Link
            to="/search"
            className="inline-block rounded-lg bg-(--color-surface) border border-(--color-border) hover:border-(--color-primary) text-white text-sm font-medium px-4 py-2 transition"
          >
            Discover more books →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
