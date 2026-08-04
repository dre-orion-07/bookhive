import { useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { booksService } from "../../modules/books/services/books.service";
import { libraryService } from "../../modules/library/services/library.service";
import { useAuthStore } from "../../shared/stores/authStore";
import type { ReadingProgress } from "../../modules/library/types/library.types";
import { useState } from "react";
import { bookshelvesService } from "../../modules/bookshelves/services/bookshelves.service";

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
              {book.averageRating && (
                <span>
                  ★ {book.averageRating.toFixed(1)}
                  {book.ratingsCount && ` (${book.ratingsCount})`}
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
    </div>
  );
}

export default BookDetailPage;
