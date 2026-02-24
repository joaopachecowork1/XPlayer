using Microsoft.EntityFrameworkCore;
using XPlayer.Domain.Entities;
using XPlayer.Domain.Enums;
using XPlayer.Domain.Repositories;

namespace XPlayer.Domain.Services;

public record SessionStopResult(Guid SessionId, int DurationSeconds, int XpAwarded);
public record HistoryItem(Guid SessionId, Guid GameId, string GameName, DateTime StartedAt, DateTime? EndedAt, int DurationSeconds, int XpAwarded, string Status);
public record DailyPointModel(DateOnly Day, int ActiveSeconds, int Sessions, int Xp);
public record ByGameItemModel(Guid GameId, string GameName, int Sessions, int ActiveSeconds, int Xp);
public record StatsModel(int TotalSessions, int TotalActiveSeconds, int AverageSessionLengthSeconds, int TotalXp, int StreakDays, IReadOnlyList<DailyPointModel> Daily, IReadOnlyList<ByGameItemModel> ByGame);

public class SessionService
{
    private readonly IUserRepository _users;
    private readonly IGameRepository _games;
    private readonly ISessionRepository _sessions;
    private readonly IUserDailyStatRepository _daily;
    private readonly IUserGameStatRepository _byGame;
    private readonly XpCalculator _xp;
    private readonly StreakService _streak;
    private readonly StatsAggregator _agg;

    public SessionService(IUserRepository users, IGameRepository games, ISessionRepository sessions, IUserDailyStatRepository daily, IUserGameStatRepository byGame, XpCalculator xp, StreakService streak, StatsAggregator agg)
    {
        _users=users; _games=games; _sessions=sessions; _daily=daily; _byGame=byGame; _xp=xp; _streak=streak; _agg=agg;
    }

    public async Task<Guid> StartAsync(string email,string displayName,string gameExternalId,string gameName,CancellationToken ct)
    {
        var user=await _users.GetOrCreateByEmailAsync(email,displayName,ct);
        var game=await _games.GetOrCreateByExternalIdAsync(gameExternalId,gameName,ct);
        var s=new Session{ Id=Guid.NewGuid(), UserId=user.Id, GameId=game.Id, StartedAt=DateTime.UtcNow, Status=SessionStatus.Active, XpAwarded=0 };
        await _sessions.AddAsync(s,ct);
        await _sessions.AddEventAsync(new SessionEvent{Id=Guid.NewGuid(),SessionId=s.Id,Type=SessionEventType.START,OccurredAt=DateTime.UtcNow},ct);
        return s.Id;
    }

    public async Task PauseAsync(Guid id,CancellationToken ct){ var s=await _sessions.GetAsync(id,ct); if(s.Status!=SessionStatus.Active) return; s.Status=SessionStatus.Paused; await _sessions.AddEventAsync(new SessionEvent{Id=Guid.NewGuid(),SessionId=s.Id,Type=SessionEventType.PAUSE,OccurredAt=DateTime.UtcNow},ct); await _sessions.SaveChangesAsync(ct); }
    public async Task ResumeAsync(Guid id,CancellationToken ct){ var s=await _sessions.GetAsync(id,ct); if(s.Status!=SessionStatus.Paused) return; s.Status=SessionStatus.Active; await _sessions.AddEventAsync(new SessionEvent{Id=Guid.NewGuid(),SessionId=s.Id,Type=SessionEventType.RESUME,OccurredAt=DateTime.UtcNow},ct); await _sessions.SaveChangesAsync(ct); }

    public async Task<SessionStopResult> StopAsync(Guid id,CancellationToken ct)
    {
        var s=await _sessions.Query().Include(x=>x.Events).FirstAsync(x=>x.Id==id,ct);
        if(s.EndedAt is null)
        {
            s.EndedAt=DateTime.UtcNow; s.Status=SessionStatus.Completed;
            await _sessions.AddEventAsync(new SessionEvent{Id=Guid.NewGuid(),SessionId=s.Id,Type=SessionEventType.STOP,OccurredAt=DateTime.UtcNow},ct);
            var active=CalculateActiveSeconds(s);
            var days=await _sessions.Query().Where(x=>x.UserId==s.UserId && x.Status==SessionStatus.Completed && x.EndedAt!=null).Select(x=>x.EndedAt!.Value.Date).Distinct().ToListAsync(ct);
            var streak=_streak.CalculateConsecutiveDays(days, DateTime.UtcNow);
            s.XpAwarded=_xp.CalculateXp(active, streak);
            await _sessions.SaveChangesAsync(ct);
            await _agg.UpdateOnSessionStop(s.UserId, s.GameId, s.EndedAt.Value, active, s.XpAwarded, ct);
        }
        return new SessionStopResult(s.Id, CalculateActiveSeconds(s), s.XpAwarded);
    }

    public async Task<IReadOnlyList<HistoryItem>> GetHistoryAsync(Guid userId,DateTime? fromUtc,DateTime? toUtc,CancellationToken ct)
    {
        var q=_sessions.Query().Where(s=>s.UserId==userId);
        if(fromUtc.HasValue) q=q.Where(s=>s.StartedAt>=fromUtc.Value);
        if(toUtc.HasValue) q=q.Where(s=>(s.EndedAt??DateTime.UtcNow)<=toUtc.Value);
        var list=await q.OrderByDescending(s=>s.StartedAt).ToListAsync(ct);
        var names=await _games.GetNamesAsync(list.Select(s=>s.GameId).Distinct(),ct);
        return list.Select(s=> new HistoryItem(s.Id,s.GameId,names.GetValueOrDefault(s.GameId,"Unknown"),s.StartedAt,s.EndedAt,CalculateActiveSeconds(s),s.XpAwarded,s.Status.ToString())).ToList();
    }

    public async Task<StatsModel> GetStatsAsync(Guid userId, DateTime? fromUtc, DateTime? toUtc, DateTime nowUtc, CancellationToken ct)
    {
        DateOnly? from = fromUtc.HasValue? DateOnly.FromDateTime(fromUtc.Value.Date): null;
        DateOnly? to = toUtc.HasValue? DateOnly.FromDateTime(toUtc.Value.Date): null;

        var daily = await _daily.RangeAsync(userId, from, to, ct);
        var byGame = await _byGame.ForUserAsync(userId, ct);

        var totalSessions = daily.Sum(d=>d.Sessions);
        var totalActive = daily.Sum(d=>d.ActiveSeconds);
        var totalXp = daily.Sum(d=>d.Xp);
        var avg = totalSessions==0?0:(int)Math.Round(totalActive/(double)totalSessions);

        // Compute streak from daily stats
        var days = daily.Select(d=>d.Day.ToDateTime(TimeOnly.MinValue).Date).ToList();
        var streak = new StreakService().CalculateConsecutiveDays(days, nowUtc);

        var dailyDto = daily.Select(d=> new DailyPointModel(d.Day, d.ActiveSeconds, d.Sessions, d.Xp)).ToList();
        var names = await _games.GetNamesAsync(byGame.Select(g=>g.GameId).Distinct(), ct);
        var byGameDto = byGame.Select(g=> new ByGameItemModel(g.GameId, names.GetValueOrDefault(g.GameId,"Unknown"), g.Sessions, g.ActiveSeconds, g.Xp)).OrderByDescending(x=>x.Xp).ToList();

        return new StatsModel(totalSessions, totalActive, avg, totalXp, streak, dailyDto, byGameDto);
    }

    private static int CalculateActiveSeconds(Session s){ var end=s.EndedAt??DateTime.UtcNow; var total=(int)(end - s.StartedAt).TotalSeconds; var paused=s.TotalPausedMs; return Math.Max(0, total - (int)Math.Round(paused/1000.0)); }
}