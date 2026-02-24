namespace XPlayer.Domain.Entities;

public class Game { public Guid Id { get; set; } public string ExternalId { get; set; } = default!; public string Name { get; set; } = default!; public string? CoverUrl { get; set; } public DateTime? Released { get; set; } public int? Metascore { get; set; } }