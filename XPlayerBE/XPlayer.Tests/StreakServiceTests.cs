using FluentAssertions;
using Xunit;
using XPlayer.Domain.Services;

namespace XPlayer.Tests;

public class StreakServiceTests
{
    private readonly StreakService _sut = new();

    [Fact]
    public void NoActivity_ReturnsZero()
    {
        var streak = _sut.CalculateConsecutiveDays([], DateTime.UtcNow);
        streak.Should().Be(0);
    }

    [Fact]
    public void ActivityOnlyToday_ReturnsOne()
    {
        var today = DateTime.UtcNow.Date;
        var streak = _sut.CalculateConsecutiveDays([today], today);
        streak.Should().Be(1);
    }

    [Fact]
    public void ThreeConsecutiveDays_ReturnsThree()
    {
        var today = new DateTime(2024, 6, 10, 0, 0, 0, DateTimeKind.Utc);
        var dates = new[]
        {
            today,
            today.AddDays(-1),
            today.AddDays(-2),
        };
        var streak = _sut.CalculateConsecutiveDays(dates, today);
        streak.Should().Be(3);
    }

    [Fact]
    public void GapInDates_CountsOnlyFromToday()
    {
        var today = new DateTime(2024, 6, 10, 0, 0, 0, DateTimeKind.Utc);
        var dates = new[]
        {
            today,
            today.AddDays(-1),
            // gap: missing June 8
            today.AddDays(-3),
        };
        var streak = _sut.CalculateConsecutiveDays(dates, today);
        streak.Should().Be(2);
    }

    [Fact]
    public void NoActivityToday_ReturnsZero()
    {
        var today = new DateTime(2024, 6, 10, 0, 0, 0, DateTimeKind.Utc);
        var yesterday = today.AddDays(-1);
        // Has activity yesterday but NOT today
        var streak = _sut.CalculateConsecutiveDays([yesterday], today);
        streak.Should().Be(0);
    }

    [Fact]
    public void DuplicateDates_CountedOnce()
    {
        var today = new DateTime(2024, 6, 10, 0, 0, 0, DateTimeKind.Utc);
        var dates = new[]
        {
            today,
            today.AddHours(3),  // same day, different time
            today.AddDays(-1),
        };
        var streak = _sut.CalculateConsecutiveDays(dates, today);
        streak.Should().Be(2);
    }

    [Fact]
    public void DateTimesWithTime_UseDatePart()
    {
        var now = new DateTime(2024, 6, 10, 22, 59, 0, DateTimeKind.Utc);
        // Activity stored at midnight
        var activityAtMidnight = new DateTime(2024, 6, 10, 0, 0, 0, DateTimeKind.Utc);
        var streak = _sut.CalculateConsecutiveDays([activityAtMidnight], now);
        streak.Should().Be(1);
    }
}
