import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookshelvesService } from "../../modules/bookshelves/services/bookshelves.service";
import { booksService } from "../../modules/books/services/books.service";
import { useQueries } from "@tanstack/react-query";

function BookshelfDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: shelves, isLoading: isLoadingShelves } = useQuery({
    queryKey: ["bookshelves"],
    queryFn: bookshelvesService.list,
  });

  const shelf = shelves?.find((s) => s.id === id);

  const bookQueries = useQueries({
    queries: (shelf?.bookIds ?? []).map((bookId) => ({
      queryKey: ["books", bookId],
      queryFn: () => booksService.getById(bookId),
    })),
  });

  const removeMutation = useMutation({
    mutationFn: (bookId: string) => bookshelvesService.removeBook(id!, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelves"] });
    },
  });

  if (isLoadingShelves) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-gray-400 font-sans">Loading shelf...</p>
      </div>
    );
  }

  if (!shelf) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center">
        <p className="text-red-400 font-sans">Shelf not found.</p>
      </div>
    );
  }

  const books = bookQueries
    .map((q) => q.data)
    .filter((book): book is NonNullable<typeof book> => !!book);

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/bookshelves"
          className="text-sm text-(--color-primary) hover:underline mb-4 inline-block"
        >
          ← All Shelves
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{shelf.icon ?? "📚"}</span>
          <h1 className="text-2xl font-sans font-semibold text-white">{shelf.name}</h1>
        </div>

        {books.length === 0 && (
          <p className="text-gray-400">
            No books on this shelf yet.{" "}
            <Link to="/search" className="text-(--color-primary) hover:underline">
              Find books to add
            </Link>
            .
          </p>
        )}

        {books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {books.map((book) => (
              <div key={book.id} className="group relative">
                <Link to={`/books/${book.id}`} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-(--color-surface) border border-(--color-border)">
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:opacity-70 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                        No cover
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white font-medium line-clamp-2">{book.title}</p>
                </Link>
                <button
                  onClick={() => removeMutation.mutate(book.id)}
                  disabled={removeMutation.isPending}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                  title="Remove from shelf"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookshelfDetailPage;
