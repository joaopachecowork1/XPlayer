using System.ComponentModel.DataAnnotations;

namespace XPlayer.Api.Models;

// "Canhões do Ano" (fun awards) entities.
// NOTE: Intentionally minimal and easy to evolve.

public enum AwardCategoryKind
{
    Sticker = 0,
    UserVote = 1
}

public sealed class AwardCategoryEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Name { get; set; } = string.Empty;

    // Optional admin-defined guidance shown to users.
    public string? Description { get; set; }
    public string? VoteQuestion { get; set; }
    // Free-form JSON (or plain text) to describe voting rules for this category.
    public string? VoteRules { get; set; }

    public int SortOrder { get; set; }

    /// <summary>
    /// Category type:
    /// - Sticker: users submit nominees (stickers) and vote in nominees
    /// - UserVote: users vote directly in a person (user)
    /// </summary>
    public AwardCategoryKind Kind { get; set; } = AwardCategoryKind.Sticker;

    public bool IsActive { get; set; } = true;
}

public sealed class NomineeEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Category can be null while pending (admin assigns later).
    public string? CategoryId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    // Stored as a relative URL served by the API (e.g. /uploads/canhoes/<file>)
    public string? ImageUrl { get; set; }

    [Required]
    public Guid SubmittedByUserId { get; set; }

    // pending | approved | rejected
    [Required]
    public string Status { get; set; } = "pending";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

// Users can propose new categories during nominations.
public sealed class CategoryProposalEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public Guid ProposedByUserId { get; set; }

    // pending | approved | rejected
    [Required]
    public string Status { get; set; } = "pending";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

// A "measure" is a fun rule for the gala night.
public sealed class GalaMeasureEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Text { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class MeasureProposalEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    public Guid ProposedByUserId { get; set; }

    // pending | approved | rejected
    [Required]
    public string Status { get; set; } = "pending";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class VoteEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string CategoryId { get; set; } = string.Empty;

    [Required]
    public string NomineeId { get; set; } = string.Empty;

    [Required]
    public Guid UserId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Vote directly in a person (user) for a given category.
/// 1 vote per (CategoryId, VoterUserId), but user may change until voting closes.
/// </summary>
public sealed class UserVoteEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string CategoryId { get; set; } = string.Empty;

    [Required]
    public Guid VoterUserId { get; set; }

    [Required]
    public Guid TargetUserId { get; set; }

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class CanhoesEventStateEntity
{
    [Key]
    public int Id { get; set; } = 1;

    // nominations | voting | locked | gala
    [Required]
    public string Phase { get; set; } = "nominations";

    public bool NominationsVisible { get; set; } = true;
    public bool ResultsVisible { get; set; } = false;
}


// ------------------------------
// Secret Santa + Wishlist
// ------------------------------

public sealed class WishlistItemEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Url { get; set; }
    public string? Notes { get; set; }

    // Relative URL served by API (e.g. /uploads/canhoes/wishlist/<file>)
    public string? ImageUrl { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class SecretSantaDrawEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Example: "canhoes2026"
    [Required]
    public string EventCode { get; set; } = "canhoes";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public Guid CreatedByUserId { get; set; }

    public bool IsLocked { get; set; } = true;
}

public sealed class SecretSantaAssignmentEntity
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string DrawId { get; set; } = string.Empty;

    [Required]
    public Guid GiverUserId { get; set; }

    [Required]
    public Guid ReceiverUserId { get; set; }
}
