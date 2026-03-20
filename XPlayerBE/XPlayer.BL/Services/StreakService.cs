namespace XPlayer.Domain.Services;

public class StreakService
{
    /// <summary>
    /// Returns how many consecutive days (ending today) appear in <paramref name="activityDatesUtc"/>.
    /// </summary>
    public int CalculateConsecutiveDays(IEnumerable<DateTime> activityDatesUtc, DateTime nowUtc)
    {
        var activeDays = new HashSet<DateTime>(activityDatesUtc.Select(d => d.Date));

        int streak = 0;
        var day = nowUtc.Date;

        while (activeDays.Contains(day))
        {
            streak++;
            day = day.AddDays(-1);
        }

        return streak;
    }
}