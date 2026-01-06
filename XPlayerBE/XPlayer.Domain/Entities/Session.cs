namespace XPlayer.Domain.Entities;

public class Session
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public Guid? TaskId { get; set; }
}