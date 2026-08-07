import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { clubsService } from "../../modules/clubs/services/clubs.service";
import type { ClubVisibility } from "../../modules/clubs/types/club.types";

const VISIBILITY_OPTIONS: { value: ClubVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "invite_only", label: "Invite Only" },
];

function ClubsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ClubVisibility>("public");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: clubs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clubs"],
    queryFn: clubsService.listPublic,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      clubsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      }),
    onSuccess: (club) => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setName("");
      setDescription("");
      setVisibility("public");
      setShowCreateForm(false);
      navigate(`/clubs/${club.id}`);
    },
  });

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-white">Book Clubs</h1>
            <p className="text-sm text-gray-400 mt-1">
              Find reading communities and start thoughtful discussions.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm((value) => !value)}
            className="rounded-lg bg-(--color-primary) hover:opacity-90 text-white text-sm font-medium px-4 py-2.5 transition"
          >
            {showCreateForm ? "Close" : "Create Club"}
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate();
            }}
            className="mb-8 rounded-lg bg-(--color-surface) border border-(--color-border) p-5 space-y-4"
          >
            <div>
              <label htmlFor="club-name" className="block text-xs font-medium text-gray-400 mb-1">
                Club name
              </label>
              <input
                id="club-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
              />
            </div>

            <div>
              <label
                htmlFor="club-description"
                className="block text-xs font-medium text-gray-400 mb-1"
              >
                Description
              </label>
              <textarea
                id="club-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
              />
            </div>

            <div>
              <label
                htmlFor="club-visibility"
                className="block text-xs font-medium text-gray-400 mb-1"
              >
                Visibility
              </label>
              <select
                id="club-visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as ClubVisibility)}
                className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {createMutation.isError && (
              <p className="text-sm text-(--color-error)">
                Could not create this club. Please check the details and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending || name.trim().length === 0}
              className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition"
            >
              {createMutation.isPending ? "Creating..." : "Create Club"}
            </button>
          </form>
        )}

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 rounded-lg bg-(--color-surface) border border-(--color-border) animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && <p className="text-(--color-error)">Could not load book clubs.</p>}

        {clubs && clubs.length === 0 && (
          <p className="text-gray-400">No public clubs yet. Create the first reading community.</p>
        )}

        {clubs && clubs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="rounded-lg bg-(--color-surface) border border-(--color-border) hover:border-(--color-primary) p-5 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-white line-clamp-2">{club.name}</h2>
                  <span className="shrink-0 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs px-2.5 py-1">
                    {club.visibility.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {club.description ??
                    "A space for readers to gather, plan sessions, and discuss books."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubsPage;
