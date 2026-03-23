using Microsoft.EntityFrameworkCore;
using XPlayer.Domain.Entities;

namespace XPlayer.Infrastructure.Db;

public class XPlayerDbContext : DbContext
{
    public XPlayerDbContext(DbContextOptions<XPlayerDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();
    }
}