using System;
using System.Collections.Generic;

namespace XPlayer.Api.DTOs;

// POCO DTOs keep the API resilient to schema evolution.
public sealed class HubPostDto
{
    public string Id { get; init; } = "";

    // Expose as string (Guid serialized) to keep the frontend simple.
    public string AuthorUserId { get; init; } = "";
    public string AuthorName { get; init; } = "";

    public string Text { get; init; } = "";

    // Back-compat (single media)
    public string? MediaUrl { get; init; }

    // Preferred: multi-media carousel
    public List<string> MediaUrls { get; init; } = new();

    public bool IsPinned { get; init; }
    public DateTime CreatedAtUtc { get; init; }

    public int LikeCount { get; init; }
    public int CommentCount { get; init; }

    public Dictionary<string, int> ReactionCounts { get; init; } = new();
    public List<string> MyReactions { get; init; } = new();
    public bool LikedByMe { get; init; }

    // Optional poll (single-choice, can change vote)
    public HubPollDto? Poll { get; init; }
}
