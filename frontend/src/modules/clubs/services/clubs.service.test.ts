import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BookClub } from "../types/club.types";

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../../lib/apiClient", () => ({
  apiClient: apiClientMock,
}));

const { clubsService } = await import("./clubs.service");

const club: BookClub = {
  id: "64f000000000000000000003",
  name: "Speculative Fiction Circle",
  description: "A club for curious readers.",
  coverImage: null,
  visibility: "public",
  ownerId: "64f000000000000000000001",
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

describe("clubsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns public clubs from the API response envelope", async () => {
    apiClientMock.get.mockResolvedValue({
      data: {
        success: true,
        message: "Public book clubs retrieved successfully.",
        data: [club],
      },
    });

    const result = await clubsService.listPublic();

    expect(result).toEqual([club]);
    expect(apiClientMock.get).toHaveBeenCalledWith("/clubs");
  });

  it("posts create club input and returns the created club", async () => {
    apiClientMock.post.mockResolvedValue({
      data: {
        success: true,
        message: "Book club created successfully.",
        data: club,
      },
    });

    const input = {
      name: club.name,
      description: club.description ?? undefined,
      visibility: club.visibility,
    };
    const result = await clubsService.create(input);

    expect(result).toEqual(club);
    expect(apiClientMock.post).toHaveBeenCalledWith("/clubs", input);
  });
});
