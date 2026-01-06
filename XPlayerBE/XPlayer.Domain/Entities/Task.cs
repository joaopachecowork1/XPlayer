namespace XPlayer.Domain.Entities;

public class Task
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Tag { get; set; }
    public DateTime CreatedAt { get; set; }
}