import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { bookshelvesService } from "../../modules/bookshelves/services/bookshelves.service";

function BookshelvesPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfIcon, setNewShelfIcon] = useState("📚");

  const { data: shelves, isLoading } = useQuery({
    queryKey: ["bookshelves"],
    queryFn: bookshelvesService.list,
  });

  const createMutation = useMutation({
    mutationFn: () => bookshelvesService.create(newShelfName.trim(), newShelfIcon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelves"] });
      setIsCreating(false);
      setNewShelfName("");
      setNewShelfIcon("📚");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookshelvesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookshelves"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShelfName.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-sans font-semibold text-white">My Bookshelves</h1>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="rounded-lg bg-(--color-primary) hover:opacity-90 text-white text-sm font-medium px-4 py-2 transition"
          >
            {isCreating ? "Cancel" : "+ New Shelf"}
          </button>
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-(--color-surface) border border-(--color-border) rounded-xl p-4 flex gap-3 items-end"
          >
            <div className="w-16">
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <input
                type="text"
                value={newShelfIcon}
                onChange={(e) => setNewShelfIcon(e.target.value)}
                maxLength={2}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2 text-center text-white focus:outline-none focus:border-(--color-primary)"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Shelf Name</label>
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                placeholder="e.g. Favourites, 2026 Reading List"
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2 text-white focus:outline-none focus:border-(--color-primary)"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending || !newShelfName.trim()}
              className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition"
            >
              Create
            </button>
          </form>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-(--color-surface) animate-pulse" />
            ))}
          </div>
        )}

        {shelves && shelves.length === 0 && !isCreating && (
          <p className="text-gray-400">
            You haven't created any shelves yet. Click "+ New Shelf" to organise your books your
            way.
          </p>
        )}

        {shelves && shelves.length > 0 && (
          <div className="space-y-3">
            {shelves.map((shelf) => (
              <div
                key={shelf.id}
                className="flex items-center justify-between bg-(--color-surface) border border-(--color-border) rounded-xl p-4"
              >
                <Link
                  to={`/bookshelves/${shelf.id}`}
                  className="flex items-center gap-3 flex-1 hover:opacity-80 transition"
                >
                  <span className="text-2xl">{shelf.icon ?? "📚"}</span>
                  <div>
                    <p className="text-white font-medium">{shelf.name}</p>
                    <p className="text-xs text-gray-400">
                      {shelf.bookIds.length} {shelf.bookIds.length === 1 ? "book" : "books"}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(shelf.id)}
                  disabled={deleteMutation.isPending}
                  className="text-xs text-red-400 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookshelvesPage;
