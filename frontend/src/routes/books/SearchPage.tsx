import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { booksService } from "../../modules/books/services/books.service";

function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");

  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => booksService.search(query),
    enabled: query.length > 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue.trim());
  };

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-sans font-semibold text-white mb-6">Discover Books</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search for books, authors, genres..."
              className="w-full rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3 text-white focus:outline-none focus:border-(--color-primary)"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md bg-(--color-primary) text-white text-sm hover:opacity-90"
            >
              Search
            </button>
          </div>
        </form>

        {isLoading && <p className="text-gray-400">Searching...</p>}
        {isError && <p className="text-red-400">Something went wrong. Please try again.</p>}

        {books && books.length === 0 && (
          <p className="text-gray-400">No books found. Try a different search.</p>
        )}

        {books && books.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`} className="group flex flex-col gap-2">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-(--color-surface) border border-(--color-border)">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                      No cover
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-medium line-clamp-2">{book.title}</p>
                  {book.authors.length > 0 && (
                    <p className="text-xs text-gray-400 line-clamp-1">{book.authors.join(", ")}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
