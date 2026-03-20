namespace XPlayer.Api.Models;

/// <summary>
/// Server-side XP calculation (single source of truth).
///
/// Rules:
///   - Base rate: 10 XP per minute played.
///   - Streak bonus: +5% per consecutive day (max +50%).
///
/// These rules match the frontend <c>XPCalculator</c> class so both
/// sides always agree on awarded XP.
/// </summary>
public static class XpCalculator
{
    private const double XpPerMinute = 10.0;
    private const double StreakBonusPerDay = 0.05;
    private const double MaxStreakBonus = 0.50;

    /// <summary>
    /// Calculates XP earned for a session.
    /// </summary>
    /// <param name="durationSeconds">Active (non-paused) seconds played.</param>
    /// <param name="streakDays">Number of consecutive days played (0 = no bonus).</param>
    public static int CalculateXp(int durationSeconds, int streakDays = 0)
    {
        if (durationSeconds < 0) durationSeconds = 0;
        if (streakDays < 0) streakDays = 0;

        var minutes = durationSeconds / 60;   // integer division = floor
        var baseXp = minutes * XpPerMinute;
        var bonus = Math.Min(streakDays * StreakBonusPerDay, MaxStreakBonus);
        return (int)Math.Floor(baseXp * (1.0 + bonus));
    }
}
