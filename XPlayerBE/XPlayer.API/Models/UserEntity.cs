using System.ComponentModel.DataAnnotations;

namespace XPlayer.Api.Models;

public sealed class UserEntity
{
    [Key]
    public required Guid Id { get; set; }

    /// <summary>
    /// External identity id (e.g. Google 'sub').
    /// </summary>
    [Required]
    public required string ExternalId { get; set; }

    [Required]
    public required string Email { get; set; }

    public string? DisplayName { get; set; }

    public bool IsAdmin { get; set; }

    public DateTime CreatedAt { get; set; }
}
