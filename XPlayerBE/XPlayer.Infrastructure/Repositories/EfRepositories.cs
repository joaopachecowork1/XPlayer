using Microsoft.EntityFrameworkCore;
using XPlayer.Domain.Entities;
using XPlayer.Domain.Repositories;
using XPlayer.Infrastructure.Db;

namespace XPlayer.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly XPlayerDbContext _db;
    public UserRepository(XPlayerDbContext db)=>_db=db;

    public async Task<User> GetOrCreateByEmailAsync(string email,string displayName,CancellationToken ct)
    {
        var user=await _db.Users.FirstOrDefaultAsync(u=>u.Email==email,ct);
        if(user is null){ user=new User{Id=Guid.NewGuid(),Email=email,DisplayName=displayName,CreatedAt=DateTime.UtcNow}; _db.Users.Add(user); await _db.SaveChangesAsync(ct); }
        return user;
    }
    public Task<User?> GetByEmailAsync(string email,CancellationToken ct) => _db.Users.FirstOrDefaultAsync(u=>u.Email==email,ct);
}

public class GameRepository:IGameRepository
{
    private readonly XPlayerDbContext _db;
    public GameRepository(XPlayerDbContext db)=>_db=db;
    public async Task<Game> GetOrCreateByExternalIdAsync(string externalId,string name,CancellationToken ct)
    {
        var game=await _db.Games.FirstOrDefaultAsync(g=>g.ExternalId==externalId,ct);
        if(game is null){ game=new Game{Id=Guid.NewGuid(),ExternalId=externalId,Name=name}; _db.Games.Add(game); await _db.SaveChangesAsync(ct); }
        return game;
    }
    public async Task<Dictionary<Guid,string>> GetNamesAsync(IEnumerable<Guid> ids,CancellationToken ct)
    {
        var list=await _db.Games.Where(g=>ids.Contains(g.Id)).Select(g=>new{g.Id,g.Name}).ToListAsync(ct);
        return list.ToDictionary(x=>x.Id,x=>x.Name);
    }
}

public class SessionRepository:ISessionRepository
{
    private readonly XPlayerDbContext _db;
    public SessionRepository(XPlayerDbContext db)=>_db=db;
    public async Task<Session> GetAsync(Guid id,CancellationToken ct)=> await _db.Sessions.Include(s=>s.Events).FirstAsync(s=>s.Id==id,ct);
    public async Task<Session> AddAsync(Session session,CancellationToken ct){ _db.Sessions.Add(session); await _db.SaveChangesAsync(ct); return session; }
    public async Task AddEventAsync(SessionEvent evt,CancellationToken ct){ _db.SessionEvents.Add(evt); await _db.SaveChangesAsync(ct); }
    public Task SaveChangesAsync(CancellationToken ct)=>_db.SaveChangesAsync(ct);
    public IQueryable<Session> Query()=>_db.Sessions.AsQueryable();
}

public class UserDailyStatRepository:IUserDailyStatRepository
{
    private readonly XPlayerDbContext _db;
    public UserDailyStatRepository(XPlayerDbContext db)=>_db=db;
    public async Task UpsertAsync(Guid userId, DateOnly day, int sessionSeconds, int sessionXp, CancellationToken ct)
    {
        var stat = await _db.UserDailyStats.FirstOrDefaultAsync(x=>x.UserId==userId && x.Day==day, ct);
        if(stat is null){ stat=new UserDailyStat{Id=Guid.NewGuid(),UserId=userId,Day=day,Sessions=1,ActiveSeconds=sessionSeconds,Xp=sessionXp}; _db.UserDailyStats.Add(stat); }
        else { stat.Sessions += 1; stat.ActiveSeconds += sessionSeconds; stat.Xp += sessionXp; }
        await _db.SaveChangesAsync(ct);
    }
    public Task<IReadOnlyList<UserDailyStat>> RangeAsync(Guid userId, DateOnly? from, DateOnly? to, CancellationToken ct)
    {
        var q = _db.UserDailyStats.Where(x=>x.UserId==userId).AsQueryable();
        if(from.HasValue) q = q.Where(x=>x.Day>=from.Value);
        if(to.HasValue) q = q.Where(x=>x.Day<=to.Value);
        return q.OrderBy(x=>x.Day).ToListAsync(ct).ContinueWith<IReadOnlyList<UserDailyStat>>(t=>t.Result, ct);
    }
}

public class UserGameStatRepository:IUserGameStatRepository
{
    private readonly XPlayerDbContext _db;
    public UserGameStatRepository(XPlayerDbContext db)=>_db=db;
    public async Task UpsertAsync(Guid userId, Guid gameId, int sessionSeconds, int sessionXp, CancellationToken ct)
    {
        var stat = await _db.UserGameStats.FirstOrDefaultAsync(x=>x.UserId==userId && x.GameId==gameId, ct);
        if(stat is null){ stat=new UserGameStat{Id=Guid.NewGuid(),UserId=userId,GameId=gameId,Sessions=1,ActiveSeconds=sessionSeconds,Xp=sessionXp}; _db.UserGameStats.Add(stat); }
        else { stat.Sessions += 1; stat.ActiveSeconds += sessionSeconds; stat.Xp += sessionXp; }
        await _db.SaveChangesAsync(ct);
    }
    public Task<IReadOnlyList<UserGameStat>> ForUserAsync(Guid userId, CancellationToken ct)
        => _db.UserGameStats.Where(x=>x.UserId==userId).ToListAsync(ct).ContinueWith<IReadOnlyList<UserGameStat>>(t=>t.Result, ct);
}