using System.ComponentModel.DataAnnotations;

namespace XPlayer.Api.Models;

// ------------------------------
// Hub / Feed (posts, likes, comments)
//
// Design goals:
// - Minimal schema (string ids = GUIDs)
// - Easy to move to a standalone app/service later
// - Simple moderation surface (admin can delete any post/comment)
// ------------------------------

public sealed class HubPostEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public Guid AuthorUserId { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Text { get; set; } = string.Empty;

    // Backwards-compatible single image (first item in MediaUrlsJson when present).
    // Keep nullable for older rows.
    public string? MediaUrl { get; set; }

    // JSON array of string URLs (carousel). Stored as NVARCHAR(MAX) in SQL Server.
    // IMPORTANT: NVARCHAR max length is 4000, so do NOT use [MaxLength(8000)].
    // Keep non-null in CLR to avoid INSERT NULL issues when DB column is NOT NULL.
    public string MediaUrlsJson { get; set; } = "[]";

    public bool IsPinned { get; set; } = false;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class HubPostLikeEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class HubPostCommentEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}


public sealed class HubPostReactionEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    // Emoji / reaction key (e.g. "❤️", "🔥", "😂")
    [Required]
    [MaxLength(16)]
    public string Emoji { get; set; } = "❤️";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

// ------------------------------
// Optional single-choice poll attached to a post.
// ------------------------------

public sealed class HubPostPollEntity
{
    [Key]
    public string PostId { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string Question { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class HubPostPollOptionEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Text { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;
}

// One vote per user per post. If user votes again, we overwrite.
public sealed class HubPostPollVoteEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string OptionId { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
