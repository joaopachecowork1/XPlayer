using XPlayer.Domain.Entities;

namespace XPlayer.Domain.Repositories;

public interface IUserRepository{ Task<User> GetOrCreateByEmailAsync(string email,string displayName,CancellationToken ct); Task<User?> GetByEmailAsync(string email,CancellationToken ct); }
public interface IGameRepository{ Task<Game> GetOrCreateByExternalIdAsync(string externalId,string name,CancellationToken ct); Task<Dictionary<Guid,string>> GetNamesAsync(IEnumerable<Guid> ids,CancellationToken ct); }
public interface ISessionRepository{ Task<Session> GetAsync(Guid id,CancellationToken ct); Task<Session> AddAsync(Session session,CancellationToken ct); Task AddEventAsync(SessionEvent evt,CancellationToken ct); Task SaveChangesAsync(CancellationToken ct); IQueryable<Session> Query(); }

public interface IUserDailyStatRepository { Task UpsertAsync(Guid userId, DateOnly day, int sessionSeconds, int sessionXp, CancellationToken ct); Task<IReadOnlyList<UserDailyStat>> RangeAsync(Guid userId, DateOnly? from, DateOnly? to, CancellationToken ct); }
public interface IUserGameStatRepository { Task UpsertAsync(Guid userId, Guid gameId, int sessionSeconds, int sessionXp, CancellationToken ct); Task<IReadOnlyList<UserGameStat>> ForUserAsync(Guid userId, CancellationToken ct); }
