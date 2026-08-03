import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { booksService } from "../../modules/books/services/books.service";

function BookDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: book,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books", id],
    queryFn: () => booksService.getById(id!),
    enabled: !!id,
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

            <button className="rounded-lg bg-(--color-primary) hover:opacity-90 text-white font-medium px-6 py-2.5 transition">
              Add to Library
            </button>
          </div>
        </div>

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
