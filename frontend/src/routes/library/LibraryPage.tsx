import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { libraryService } from "../../modules/library/services/library.service";
import type { ReadingProgress } from "../../modules/library/types/library.types";

const TABS: { value: ReadingProgress["status"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "want_to_read", label: "Want to Read" },
  { value: "currently_reading", label: "Currently Reading" },
  { value: "completed", label: "Finished" },
  { value: "dropped", label: "Dropped" },
];

function LibraryPage() {
  const [activeTab, setActiveTab] = useState<ReadingProgress["status"] | "all">("all");

  const { data: library, isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: libraryService.getLibrary,
  });

  const { data: progressHistory } = useQuery({
    queryKey: ["reading-progress-history"],
    queryFn: libraryService.getHistory,
  });

  const progressByBookId = new Map(
    (progressHistory ?? []).map((entry) => [entry.bookId, entry.status])
  );

  const filteredLibrary =
    activeTab === "all"
      ? library
      : library?.filter((entry) => progressByBookId.get(entry.bookId) === activeTab);

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-sans font-semibold text-white mb-6">My Library</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={
                activeTab === tab.value
                  ? "px-4 py-2 rounded-lg bg-(--color-primary) text-white text-sm"
                  : "px-4 py-2 rounded-lg bg-(--color-surface) border border-(--color-border) text-gray-300 text-sm hover:border-(--color-primary)"
              }
            >
              {tab.label}
            </button>
          ))}
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

        {filteredLibrary && filteredLibrary.length === 0 && (
          <p className="text-gray-400">
            {activeTab === "all" ? (
              <>
                Your library is empty.{" "}
                <Link to="/search" className="text-(--color-primary) hover:underline">
                  Discover books
                </Link>{" "}
                to get started.
              </>
            ) : (
              "No books in this section yet."
            )}
          </p>
        )}

        {filteredLibrary && filteredLibrary.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {filteredLibrary.map((entry) => (
              <Link
                key={entry.id}
                to={`/books/${entry.bookId}`}
                className="group flex flex-col gap-2"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-(--color-surface) border border-(--color-border)">
                  {entry.book.thumbnail ? (
                    <img
                      src={entry.book.thumbnail}
                      alt={entry.book.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-2 text-center">
                      No cover
                    </div>
                  )}
                </div>
                <p className="text-sm text-white font-medium line-clamp-2">{entry.book.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
