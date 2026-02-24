using System.ComponentModel.DataAnnotations;

namespace XPlayer.Api.Models;

public class SessionEntity
{
    [Key]
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string GameId { get; set; } = string.Empty;
    public GameEntity? Game { get; set; }

    public string GameName { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? Released { get; set; }
    public int? Score { get; set; }
    public string? Platform { get; set; }

    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? EndedAt { get; set; }

    public int? DurationSeconds { get; set; }
    public int? XpEarned { get; set; }

    public SessionStatus Status { get; set; } = SessionStatus.ACTIVE;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
