using Microsoft.EntityFrameworkCore;
using Canhoes.Domain.Entities;

namespace Canhoes.Infrastructure.Db;

public class CanhoesDbContext : DbContext
{
    public CanhoesDbContext(DbContextOptions<CanhoesDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(x => x.Email).IsUnique();
    }
}
