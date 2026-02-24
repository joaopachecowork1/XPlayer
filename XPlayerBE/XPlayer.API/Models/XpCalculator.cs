namespace XPlayer.Api.Models;

/// <summary>
/// Server-side XP calculation.
/// Keep it deterministic and centralized so the frontend doesn't have to guess.
/// TODO: Adjust formula (for now: 1 XP per second).
/// </summary>
public static class XpCalculator
{
    public static int CalculateXp(int durationSeconds)
    {
        if (durationSeconds < 0) durationSeconds = 0;
        return durationSeconds; // TODO: decide real XP rules
    }
}
