using FluentAssertions;
using Xunit;
using XPlayer.Domain.Services;

namespace XPlayer.Tests;

public class XpCalculatorTests
{
    // XpCalculator is a static class; tests call its static methods directly.

    [Theory]
    [InlineData(0, 0, 0)]       // no time, no xp
    [InlineData(60, 0, 10)]     // 1 minute → 10 XP
    [InlineData(120, 0, 20)]    // 2 minutes → 20 XP
    [InlineData(3600, 0, 600)]  // 1 hour → 600 XP
    public void CalculateXp_NoStreak_ReturnsBaseXp(int durationSeconds, int streakDays, int expectedXp)
    {
        var result = XPlayer.Api.Models.XpCalculator.CalculateXp(durationSeconds, streakDays);
        result.Should().Be(expectedXp);
    }

    [Theory]
    [InlineData(60, 1, 10)]   // 10 * 1.05 = 10.5 → floor = 10
    [InlineData(60, 10, 15)]  // 10 * 1.50 = 15
    [InlineData(60, 20, 15)]  // streak > 10d: cap at 50% → 10 * 1.50 = 15
    public void CalculateXp_WithStreak_AppliesBonus(int durationSeconds, int streakDays, int expectedXp)
    {
        var result = XPlayer.Api.Models.XpCalculator.CalculateXp(durationSeconds, streakDays);
        result.Should().Be(expectedXp);
    }

    [Fact]
    public void CalculateXp_NegativeDuration_TreatedAsZero()
    {
        var result = XPlayer.Api.Models.XpCalculator.CalculateXp(-100);
        result.Should().Be(0);
    }

    [Fact]
    public void CalculateXp_NegativeStreak_TreatedAsZero()
    {
        var result = XPlayer.Api.Models.XpCalculator.CalculateXp(60, -5);
        // same as no streak: 10 XP
        result.Should().Be(10);
    }

    [Fact]
    public void CalculateXp_SubMinute_ReturnsZero()
    {
        // Less than 60 s → 0 full minutes → 0 XP
        var result = XPlayer.Api.Models.XpCalculator.CalculateXp(59);
        result.Should().Be(0);
    }
}
