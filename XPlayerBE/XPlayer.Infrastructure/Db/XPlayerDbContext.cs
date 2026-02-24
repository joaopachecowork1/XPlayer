using Microsoft.EntityFrameworkCore;
using XPlayer.Domain.Entities;

namespace XPlayer.Infrastructure.Db;
public class XPlayerDbContext : DbContext
{
    public XPlayerDbContext(DbContextOptions<XPlayerDbContext> options):base(options){}
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<SessionEvent> SessionEvents => Set<SessionEvent>();
    public DbSet<UserDailyStat> UserDailyStats => Set<UserDailyStat>();
    public DbSet<UserGameStat> UserGameStats => Set<UserGameStat>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(x=>x.Email).IsUnique();
        b.Entity<Game>().HasIndex(x=>x.ExternalId).IsUnique();
        b.Entity<Session>().HasIndex(x=>new{ x.UserId, x.GameId });
        b.Entity<SessionEvent>().HasIndex(x=>x.SessionId);
        b.Entity<UserDailyStat>().HasIndex(x=>new{ x.UserId, x.Day }).IsUnique();
        b.Entity<UserGameStat>().HasIndex(x=>new{ x.UserId, x.GameId }).IsUnique();
    }
}