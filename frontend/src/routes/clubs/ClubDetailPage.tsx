import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { clubsService } from "../../modules/clubs/services/clubs.service";
import { useAuthStore } from "../../shared/stores/authStore";
import type { ClubVisibility } from "../../modules/clubs/types/club.types";

const VISIBILITY_OPTIONS: { value: ClubVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "invite_only", label: "Invite Only" },
];

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isEditingClub, setIsEditingClub] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState<ClubVisibility>("public");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000))
  );
  const [eventEndTime, setEventEndTime] = useState("");

  const {
    data: club,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clubs", id],
    queryFn: () => clubsService.getById(id!),
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ["clubs", id, "members"],
    queryFn: () => clubsService.listMembers(id!),
    enabled: !!id && !!club,
  });

  const { data: events } = useQuery({
    queryKey: ["clubs", id, "events"],
    queryFn: () => clubsService.listUpcomingEvents(id!),
    enabled: !!id && !!club,
  });

  // Discussions
  const [discussionsPage] = useState(1);
  const discussionsLimit = 10;
  const { data: discussions } = useQuery({
    queryKey: ["clubs", id, "discussions", discussionsPage],
    queryFn: () => clubsService.listDiscussions(id!, discussionsPage, discussionsLimit),
    enabled: !!id && !!club,
  });

  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");

  const createDiscussionMutation = useMutation({
    mutationFn: () =>
      clubsService.createDiscussion(id!, {
        title: newDiscussionTitle.trim(),
        content: newDiscussionContent.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs", id, "discussions"] });
      setNewDiscussionTitle("");
      setNewDiscussionContent("");
    },
  });

  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const { data: selectedDiscussion } = useQuery({
    queryKey: ["clubs", id, "discussion", selectedDiscussionId],
    queryFn: () => clubsService.getDiscussionById(id!, selectedDiscussionId!),
    enabled: !!id && !!selectedDiscussionId,
  });

  const { data: comments } = useQuery({
    queryKey: ["clubs", id, "discussion", selectedDiscussionId, "comments"],
    queryFn: () => clubsService.listComments(id!, selectedDiscussionId!, 1, 50),
    enabled: !!id && !!selectedDiscussionId,
  });

  const [newCommentContent, setNewCommentContent] = useState("");
  const createCommentMutation = useMutation({
    mutationFn: () =>
      clubsService.createComment(id!, selectedDiscussionId!, { content: newCommentContent.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clubs", id, "discussion", selectedDiscussionId, "comments"],
      });
      setNewCommentContent("");
    },
  });

  const currentMembership = useMemo(
    () => members?.find((member) => member.userId === currentUser?.id),
    [currentUser?.id, members]
  );
  const canManageEvents =
    currentMembership?.role === "owner" || currentMembership?.role === "moderator";
  const isOwner = club?.ownerId === currentUser?.id;
  const canJoin = club?.visibility === "public" && !currentMembership;

  const joinMutation = useMutation({
    mutationFn: () => clubsService.join(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs", id] });
      queryClient.invalidateQueries({ queryKey: ["clubs", id, "members"] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => clubsService.leave(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs", id] });
      queryClient.invalidateQueries({ queryKey: ["clubs", id, "members"] });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: () =>
      clubsService.createEvent(id!, {
        title: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        startTime: new Date(eventStartTime).toISOString(),
        endTime: eventEndTime ? new Date(eventEndTime).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs", id, "events"] });
      setEventTitle("");
      setEventDescription("");
      setEventStartTime(toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
      setEventEndTime("");
    },
  });

  const updateClubMutation = useMutation({
    mutationFn: () =>
      clubsService.update(id!, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        visibility: editVisibility,
      }),
    onSuccess: (updatedClub) => {
      queryClient.setQueryData(["clubs", id], {
        ...updatedClub,
        memberCount: club?.memberCount ?? 0,
      });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsEditingClub(false);
    },
  });

  const deleteClubMutation = useMutation({
    mutationFn: () => clubsService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      navigate("/clubs");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-background) px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-48 rounded-lg bg-(--color-surface) border border-(--color-border) animate-pulse" />
          <div className="h-32 rounded-lg bg-(--color-surface) border border-(--color-border) animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="min-h-screen bg-(--color-background) flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-(--color-error) mb-3">Could not load this club.</p>
          <Link to="/clubs" className="text-(--color-primary) hover:underline">
            Back to clubs
          </Link>
        </div>
      </div>
    );
  }

  const startEditingClub = () => {
    setEditName(club.name);
    setEditDescription(club.description ?? "");
    setEditVisibility(club.visibility);
    setIsEditingClub(true);
  };

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/clubs" className="text-sm text-(--color-primary) hover:underline">
          Back to clubs
        </Link>

        <section className="mt-4 rounded-lg bg-(--color-surface) border border-(--color-border) p-6">
          {isEditingClub ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                updateClubMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="edit-club-name" className="block text-xs text-gray-400 mb-1">
                  Club name
                </label>
                <input
                  id="edit-club-name"
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={100}
                  required
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                />
              </div>
              <div>
                <label htmlFor="edit-club-description" className="block text-xs text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-club-description"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                />
              </div>
              <div>
                <label htmlFor="edit-club-visibility" className="block text-xs text-gray-400 mb-1">
                  Visibility
                </label>
                <select
                  id="edit-club-visibility"
                  value={editVisibility}
                  onChange={(event) => setEditVisibility(event.target.value as ClubVisibility)}
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {updateClubMutation.isError && (
                <p className="text-sm text-(--color-error)">
                  Could not update this club. Please try again.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={updateClubMutation.isPending || editName.trim().length === 0}
                  className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition"
                >
                  {updateClubMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingClub(false)}
                  className="rounded-lg border border-(--color-border) hover:bg-(--color-border) text-white text-sm font-medium px-4 py-2.5 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl font-sans font-semibold text-white">{club.name}</h1>
                  <span className="rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs px-2.5 py-1">
                    {club.visibility.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-400 max-w-2xl">
                  {club.description ?? "This club has not added a description yet."}
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  {club.memberCount} {club.memberCount === 1 ? "member" : "members"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOwner && (
                  <>
                    <button
                      onClick={startEditingClub}
                      className="rounded-lg border border-(--color-border) hover:bg-(--color-border) text-white text-sm font-medium px-4 py-2.5 transition"
                    >
                      Edit Club
                    </button>
                    <button
                      onClick={() => deleteClubMutation.mutate()}
                      disabled={deleteClubMutation.isPending}
                      className="rounded-lg border border-(--color-error) text-(--color-error) hover:bg-(--color-error) hover:text-white disabled:opacity-50 text-sm font-medium px-4 py-2.5 transition"
                    >
                      {deleteClubMutation.isPending ? "Deleting..." : "Delete Club"}
                    </button>
                  </>
                )}

                {canJoin && (
                  <button
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition"
                  >
                    {joinMutation.isPending ? "Joining..." : "Join Club"}
                  </button>
                )}

                {currentMembership && !isOwner && (
                  <button
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                    className="rounded-lg border border-(--color-border) hover:bg-(--color-border) disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition"
                  >
                    {leaveMutation.isPending ? "Leaving..." : "Leave Club"}
                  </button>
                )}
              </div>
            </div>
          )}

          {(joinMutation.isError || leaveMutation.isError || deleteClubMutation.isError) && (
            <p className="text-sm text-(--color-error) mt-4">
              Could not complete this club action. Please try again.
            </p>
          )}
        </section>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-6">
          <section className="space-y-6">
            <div className="rounded-lg bg-(--color-surface) border border-(--color-border) p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Discussions</h2>

              {discussions && discussions.length === 0 && (
                <p className="text-sm text-gray-400">No discussions yet. Start the conversation.</p>
              )}

              {discussions && discussions.length > 0 && (
                <div className="space-y-3">
                  {discussions.map((d) => (
                    <article
                      key={d.id}
                      className="rounded-lg bg-(--color-background) border border-(--color-border) p-3 cursor-pointer"
                      onClick={() => setSelectedDiscussionId(d.id)}
                    >
                      <h3 className="text-white font-medium truncate">{d.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createDiscussionMutation.mutate();
                }}
                className="mt-4 space-y-3"
              >
                <input
                  type="text"
                  value={newDiscussionTitle}
                  onChange={(e) => setNewDiscussionTitle(e.target.value)}
                  placeholder="Discussion title"
                  maxLength={200}
                  required
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm"
                />
                <textarea
                  value={newDiscussionContent}
                  onChange={(e) => setNewDiscussionContent(e.target.value)}
                  placeholder="Write your discussion content"
                  rows={4}
                  maxLength={5000}
                  required
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      createDiscussionMutation.isPending || newDiscussionTitle.trim().length === 0
                    }
                    className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5"
                  >
                    {createDiscussionMutation.isPending ? "Posting..." : "Start Discussion"}
                  </button>
                </div>
              </form>

              {selectedDiscussion && (
                <div className="mt-4 rounded-lg bg-(--color-background) border border-(--color-border) p-4">
                  <h3 className="text-white font-semibold">{selectedDiscussion.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{selectedDiscussion.content}</p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-white mb-2">Replies</h4>
                    {comments && comments.length === 0 && (
                      <p className="text-sm text-gray-400">No replies yet.</p>
                    )}
                    {comments && comments.length > 0 && (
                      <div className="space-y-3">
                        {comments.map((c) => (
                          <div key={c.id} className="border-t border-(--color-border) pt-2">
                            <p className="text-sm text-gray-300">{c.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(c.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        createCommentMutation.mutate();
                      }}
                      className="mt-3 space-y-2"
                    >
                      <textarea
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        placeholder="Write a reply"
                        rows={3}
                        maxLength={3000}
                        required
                        className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={
                            createCommentMutation.isPending || newCommentContent.trim().length === 0
                          }
                          className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5"
                        >
                          {createCommentMutation.isPending ? "Replying..." : "Reply"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDiscussionId(null)}
                          className="rounded-lg border border-(--color-border) text-white text-sm font-medium px-4 py-2.5"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-(--color-surface) border border-(--color-border) p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Upcoming Events</h2>

              {events && events.length === 0 && (
                <p className="text-sm text-gray-400">No upcoming events have been scheduled.</p>
              )}

              {events && events.length > 0 && (
                <div className="space-y-3">
                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-lg bg-(--color-background) border border-(--color-border) p-4"
                    >
                      <h3 className="text-white font-medium">{event.title}</h3>
                      <p className="text-xs text-(--color-primary) mt-1">
                        {formatDateTime(event.startTime)}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-2">{event.description}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            {canManageEvents && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  createEventMutation.mutate();
                }}
                className="rounded-lg bg-(--color-surface) border border-(--color-border) p-5 space-y-4"
              >
                <h2 className="text-lg font-semibold text-white">Schedule Event</h2>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  placeholder="Event title"
                  maxLength={150}
                  required
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                />
                <textarea
                  value={eventDescription}
                  onChange={(event) => setEventDescription(event.target.value)}
                  placeholder="Description"
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="datetime-local"
                    value={eventStartTime}
                    onChange={(event) => setEventStartTime(event.target.value)}
                    required
                    className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                  />
                  <input
                    type="datetime-local"
                    value={eventEndTime}
                    onChange={(event) => setEventEndTime(event.target.value)}
                    className="w-full rounded-lg bg-(--color-background) border border-(--color-border) px-3 py-2.5 text-white text-sm focus:outline-none focus:border-(--color-primary)"
                  />
                </div>

                {createEventMutation.isError && (
                  <p className="text-sm text-(--color-error)">
                    Could not schedule this event. Check the time and try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={createEventMutation.isPending || eventTitle.trim().length === 0}
                  className="rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 transition"
                >
                  {createEventMutation.isPending ? "Scheduling..." : "Schedule Event"}
                </button>
              </form>
            )}
          </section>

          <aside className="rounded-lg bg-(--color-surface) border border-(--color-border) p-5 h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">Members</h2>
            {!members && <p className="text-sm text-gray-400">Loading members...</p>}
            {members && members.length === 0 && (
              <p className="text-sm text-gray-400">No members yet.</p>
            )}
            {members && members.length > 0 && (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 text-sm border-b border-(--color-border) pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-gray-300 truncate">{member.userId}</span>
                    <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ClubDetailPage;
