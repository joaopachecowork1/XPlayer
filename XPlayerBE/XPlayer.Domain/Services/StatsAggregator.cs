
using XPlayer.Domain.Repositories;

namespace XPlayer.Domain.Services;

public class StatsAggregator
{
    private readonly IUserDailyStatRepository _daily;
    private readonly IUserGameStatRepository _byGame;
    public StatsAggregator(IUserDailyStatRepository daily, IUserGameStatRepository byGame){ _daily=daily; _byGame=byGame; }

    public async Task UpdateOnSessionStop(Guid userId, Guid gameId, DateTime endedAtUtc, int activeSeconds, int xp, CancellationToken ct)
    {
        var day = DateOnly.FromDateTime(endedAtUtc.Date);
        await _daily.UpsertAsync(userId, day, activeSeconds, xp, ct);
        await _byGame.UpsertAsync(userId, gameId, activeSeconds, xp, ct);
    }
}