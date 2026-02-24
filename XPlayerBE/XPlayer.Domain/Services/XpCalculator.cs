namespace XPlayer.Domain.Services;
public class XpCalculator
{
    public int CalculateXp(int durationSeconds, int consecutiveDays)
    {
        var baseXp = (int)Math.Round(durationSeconds/60.0*10.0);
        var bonus = Math.Min(consecutiveDays*0.05, 0.50);
        return (int)Math.Round(baseXp*(1.0+bonus));
    }
}