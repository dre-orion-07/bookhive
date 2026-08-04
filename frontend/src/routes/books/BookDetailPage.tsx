import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { booksService } from "../../modules/books/services/books.service";
import { libraryService } from "../../modules/library/services/library.service";
import { useAuthStore } from "../../shared/stores/authStore";
import type { ReadingProgress } from "../../modules/library/types/library.types";
import { useState } from "react";
import { bookshelvesService } from "../../modules/bookshelves/services/bookshelves.service";
import { reviewsService } from "../../modules/reviews/services/reviews.service";
import type { Review } from "../../modules/reviews/types/review.types";

const STATUS_LABELS: Record<ReadingProgress["status"], string> = {
  want_to_read: "Want to Read",
  currently_reading: "Currently Reading",
  completed: "Completed",
  dropped: "Dropped",
  paused: "Paused",
};

function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const {
    data: book,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books", id],
    queryFn: () => booksService.getById(id!),
    enabled: !!id,
  });

  const { data: library } = useQuery({
    queryKey: ["library"],
    queryFn: libraryService.getLibrary,
    enabled: !!currentUser,
  });

  const { data: progress } = useQuery({
    queryKey: ["reading-progress", id],
    queryFn: () => libraryService.getProgress(id!),
    enabled: !!id && !!currentUser,
  });

  const isInLibrary = library?.some((entry) => entry.bookId === id) ?? false;

  const addMutation = useMutation({
    mutationFn: () => libraryService.addBook(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => libraryService.removeBook(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: (status: ReadingProgress["status"]) =>
      libraryService.updateProgress(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-progress", id] });
    },
  });

  const [showShelfMenu, setShowShelfMenu] = useState(false);

  const { data: shelves } = useQuery({
    queryKey: ["bookshelves"],
    queryFn: bookshelvesService.list,
    enabled: !!currentUser,
  });

  const addToShelfMutation = useMutation({
    mutationFn: (shelfId: string) => bookshelvesService.addBook(shelfId, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelves"] });
      setShowShelfMenu(false);
    },
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsService.listForBook(id!),
    enabled: !!id,
  });

  const myReview = reviews?.find((r) => r.userId === currentUser?.id);

  const createReviewMutation = useMutation({
    mutationFn: () =>
      reviewsService.create({
        bookId: id!,
        rating: reviewRating,
        title: reviewTitle || undefined,
        content: reviewContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["books", id] });
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewContent("");
      setReviewRating(5);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsService.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["books", id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsService.toggleLike(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-background) px-4 py-8">
        <div className="max-w-3xl mx-auto bg-(--color-surface) border border-(--color-border) rounded-2xl p-8 animate-pulse">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-40 shrink-0">
              <div className="aspect-[2/3] rounded-lg bg-(--color-border)" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-7 w-3/4 rounded bg-(--color-border)" />
              <div className="h-4 w-1/3 rounded bg-(--color-border)" />
              <div className="h-6 w-20 rounded-full bg-(--color-border)" />
              <div className="h-4 w-1/2 rounded bg-(--color-border)" />
              <div className="h-10 w-36 rounded-lg bg-(--color-border) mt-4" />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-(--color-border) space-y-2">
            <div className="h-4 w-full rounded bg-(--color-border)" />
            <div className="h-4 w-full rounded bg-(--color-border)" />
            <div className="h-4 w-2/3 rounded bg-(--color-border)" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-red-400 font-sans">Could not find this book.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-3xl mx-auto bg-(--color-surface) border border-(--color-border) rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-40 shrink-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-(--color-background) border border-(--color-border)">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                  No cover
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-sans font-semibold text-white mb-1">{book.title}</h1>
            {book.subtitle && <p className="text-gray-400 mb-2">{book.subtitle}</p>}
            {book.authors.length > 0 && (
              <p className="text-sm text-(--color-primary) mb-4">{book.authors.join(", ")}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {book.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs"
                >
                  {category}
                </span>
              ))}
            </div>

            <div className="flex gap-4 text-sm text-gray-400 mb-4">
              {book.publishedDate && <span>{book.publishedDate}</span>}
              {book.pageCount && <span>{book.pageCount} pages</span>}
              {book.communityAverageRating !== null && (
                <span>
                  ★ {book.communityAverageRating.toFixed(1)} ({book.communityRatingsCount} community
                  {book.communityRatingsCount === 1 ? " rating" : " ratings"})
                </span>
              )}
              {book.communityAverageRating === null && book.providerAverageRating !== null && (
                <span>
                  ★ {book.providerAverageRating.toFixed(1)}
                  {book.providerRatingsCount && ` (${book.providerRatingsCount})`}
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => (isInLibrary ? removeMutation.mutate() : addMutation.mutate())}
                  disabled={addMutation.isPending || removeMutation.isPending}
                  className={
                    isInLibrary
                      ? "rounded-lg border border-(--color-border) hover:bg-(--color-border) text-white font-medium px-6 py-2.5 transition disabled:opacity-50"
                      : "rounded-lg bg-(--color-primary) hover:opacity-90 text-white font-medium px-6 py-2.5 transition disabled:opacity-50"
                  }
                >
                  {isInLibrary ? "Remove from Library" : "Add to Library"}
                </button>

                {isInLibrary && (
                  <select
                    value={progress?.status ?? "want_to_read"}
                    onChange={(e) =>
                      progressMutation.mutate(e.target.value as ReadingProgress["status"])
                    }
                    className="rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sign in to add this book to your library.</p>
            )}
          </div>
        </div>

        {isInLibrary && shelves && shelves.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowShelfMenu(!showShelfMenu)}
              className="rounded-lg border border-(--color-border) hover:bg-(--color-border) text-white text-sm font-medium px-4 py-2.5 transition"
            >
              + Add to Shelf
            </button>
            {showShelfMenu && (
              <div className="absolute top-full mt-2 left-0 bg-(--color-surface) border border-(--color-border) rounded-lg shadow-lg py-2 min-w-48 z-10">
                {shelves.map((shelf) => (
                  <button
                    key={shelf.id}
                    onClick={() => addToShelfMutation.mutate(shelf.id)}
                    disabled={shelf.bookIds.includes(id!)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-(--color-background) disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>{shelf.icon ?? "📚"}</span>
                    <span>{shelf.name}</span>
                    {shelf.bookIds.includes(id!) && (
                      <span className="text-xs text-gray-500 ml-auto">Added</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {book.description && (
          <div className="mt-8 pt-6 border-t border-(--color-border)">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Description</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>
        )}
      </div>
      <div className="mt-8 pt-6 border-t border-(--color-border)">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-500">
            Reviews {reviews && `(${reviews.length})`}
          </h2>
          {currentUser && !myReview && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm text-(--color-primary) hover:underline"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createReviewMutation.mutate();
            }}
            className="mb-6 bg-(--color-background) border border-(--color-border) rounded-xl p-4 space-y-3"
          >
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={
                      star <= reviewRating
                        ? "text-(--color-accent) text-xl"
                        : "text-gray-600 text-xl"
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-2 text-white text-sm focus:outline-none focus:border-(--color-primary)"
            />
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              required
              className="w-full rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-2 text-white text-sm focus:outline-none focus:border-(--color-primary)"
            />
            <button
              type="submit"
              disabled={createReviewMutation.isPending || !reviewContent.trim()}
              className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition"
            >
              {createReviewMutation.isPending ? "Posting..." : "Post Review"}
            </button>
          </form>
        )}

        {reviews && reviews.length === 0 && (
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to share your thoughts.
          </p>
        )}

        {reviews && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review.id} className="border-b border-(--color-border) pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex text-(--color-accent) text-sm">
                    {"★".repeat(review.rating)}
                    <span className="text-gray-700">{"★".repeat(5 - review.rating)}</span>
                  </div>
                  {review.userId === currentUser?.id && (
                    <button
                      onClick={() => deleteReviewMutation.mutate(review.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {review.title && (
                  <p className="text-white font-medium text-sm mb-1">{review.title}</p>
                )}
                <p className="text-gray-300 text-sm mb-2">{review.content}</p>
                <button
                  onClick={() => likeMutation.mutate(review.id)}
                  disabled={!currentUser}
                  className="text-xs text-gray-500 hover:text-(--color-primary) disabled:hover:text-gray-500 disabled:cursor-not-allowed"
                >
                  👍 {review.likedBy.length > 0 && review.likedBy.length}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetailPage;
