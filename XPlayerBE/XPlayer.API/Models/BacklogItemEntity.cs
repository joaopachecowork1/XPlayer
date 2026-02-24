using System.ComponentModel.DataAnnotations;

namespace XPlayer.Api.Models;

public class BacklogItemEntity
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string GameId { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? Released { get; set; }
    public int? Score { get; set; }

    public int TotalPlaySeconds { get; set; }
    public int TotalXp { get; set; }
    public int SessionsCount { get; set; }
    public DateTimeOffset? LastPlayedAt { get; set; }

    public DateTimeOffset AddedAt { get; set; } = DateTimeOffset.UtcNow;
}
