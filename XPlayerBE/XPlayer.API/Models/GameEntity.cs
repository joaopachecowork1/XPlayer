namespace XPlayer.Api.Models;

public class GameEntity
{
    // RAWG game id comes as string in the current frontend.
    // TODO: if you want strict numeric ids later, migrate to int.
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? Released { get; set; }
    public int? Score { get; set; } // e.g., Metacritic
}
