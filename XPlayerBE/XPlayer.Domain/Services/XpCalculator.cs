namespace XPlayer.Domain.Services;

public static class XpCalculator
{
    public static int CalculateXp(TimeSpan duration)
    {
        var minutes = duration.TotalMinutes;
        return (int)Math.Min(60, minutes * 0.75);
    }
}