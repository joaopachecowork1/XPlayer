namespace XPlayer.Domain.Services;
public class StreakService
{
    public int CalculateConsecutiveDays(IEnumerable<DateTime> activityDatesUtc, DateTime nowUtc)
    {
        var set = new HashSet<DateTime>(activityDatesUtc.Select(d=>d.Date));
        int streak=0; var day=nowUtc.Date; while(set.Contains(day)){ streak++; day=day.AddDays(-1);} return streak;
    }
}