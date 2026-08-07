import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  listPublic: vi.fn(),
  findMembership: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  listMembers: vi.fn(),
  countMembers: vi.fn(),
  createEvent: vi.fn(),
  listUpcomingEvents: vi.fn(),
}));

vi.mock("./clubs.repository.js", () => ({
  clubsRepository: repositoryMocks,
}));

const { clubsService } = await import("./clubs.service.js");

const ownerId = "64f000000000000000000001";
const memberId = "64f000000000000000000002";
const clubId = "64f000000000000000000003";

function createClub(overrides: Partial<{ visibility: string; ownerId: string }> = {}) {
  return {
    id: clubId,
    name: "Speculative Fiction Circle",
    description: "A club for curious readers.",
    coverImage: null,
    visibility: overrides.visibility ?? "public",
    ownerId: overrides.ownerId ?? ownerId,
    createdAt: new Date("2026-08-01T10:00:00.000Z"),
    updatedAt: new Date("2026-08-01T10:00:00.000Z"),
  };
}

describe("clubsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an owner membership when a club is created", async () => {
    const club = createClub();
    repositoryMocks.create.mockResolvedValue(club);
    repositoryMocks.addMember.mockResolvedValue({
      id: "64f000000000000000000004",
      clubId,
      userId: ownerId,
      role: "owner",
      joinedAt: new Date("2026-08-01T10:00:00.000Z"),
    });

    const result = await clubsService.create(ownerId, {
      name: club.name,
      description: club.description,
      visibility: "public",
    });

    expect(result).toEqual(club);
    expect(repositoryMocks.create).toHaveBeenCalledWith(ownerId, {
      name: club.name,
      description: club.description,
      visibility: "public",
    });
    expect(repositoryMocks.addMember).toHaveBeenCalledWith(clubId, ownerId, "owner");
  });

  it("prevents non-members from viewing private clubs", async () => {
    repositoryMocks.findById.mockResolvedValue(createClub({ visibility: "private" }));
    repositoryMocks.findMembership.mockResolvedValue(null);

    await expect(clubsService.getById(clubId, memberId)).rejects.toMatchObject({
      statusCode: 403,
      code: "ACCESS_DENIED",
    });
  });

  it("prevents duplicate public club memberships", async () => {
    repositoryMocks.findById.mockResolvedValue(createClub());
    repositoryMocks.findMembership.mockResolvedValue({
      id: "64f000000000000000000005",
      clubId,
      userId: memberId,
      role: "member",
      joinedAt: new Date("2026-08-01T10:00:00.000Z"),
    });

    await expect(clubsService.join(clubId, memberId)).rejects.toMatchObject({
      statusCode: 422,
      code: "VALIDATION_ERROR",
    });
  });

  it("allows owners and moderators to create valid future events", async () => {
    repositoryMocks.findById.mockResolvedValue(createClub());
    repositoryMocks.findMembership.mockResolvedValue({
      id: "64f000000000000000000006",
      clubId,
      userId: ownerId,
      role: "moderator",
      joinedAt: new Date("2026-08-01T10:00:00.000Z"),
    });
    repositoryMocks.createEvent.mockResolvedValue({
      id: "64f000000000000000000007",
      clubId,
      title: "August discussion",
      description: null,
      startTime: new Date("2026-08-10T18:00:00.000Z"),
      endTime: new Date("2026-08-10T19:00:00.000Z"),
      videoRoomId: null,
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
    });

    await clubsService.createEvent(clubId, ownerId, {
      title: "August discussion",
      startTime: "2026-08-10T18:00:00.000Z",
      endTime: "2026-08-10T19:00:00.000Z",
    });

    expect(repositoryMocks.createEvent).toHaveBeenCalledWith(clubId, {
      title: "August discussion",
      description: undefined,
      startTime: new Date("2026-08-10T18:00:00.000Z"),
      endTime: new Date("2026-08-10T19:00:00.000Z"),
    });
  });

  it("rejects events that end before they start", async () => {
    repositoryMocks.findById.mockResolvedValue(createClub());
    repositoryMocks.findMembership.mockResolvedValue({
      id: "64f000000000000000000008",
      clubId,
      userId: ownerId,
      role: "owner",
      joinedAt: new Date("2026-08-01T10:00:00.000Z"),
    });

    await expect(
      clubsService.createEvent(clubId, ownerId, {
        title: "Backwards event",
        startTime: "2026-08-10T19:00:00.000Z",
        endTime: "2026-08-10T18:00:00.000Z",
      })
    ).rejects.toMatchObject({
      statusCode: 422,
      code: "VALIDATION_ERROR",
    });
  });
});
