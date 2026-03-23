using Microsoft.EntityFrameworkCore;
using XPlayer.Domain.Entities;
using XPlayer.Domain.Repositories;
using XPlayer.Infrastructure.Db;

namespace XPlayer.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly XPlayerDbContext _db;
    public UserRepository(XPlayerDbContext db) => _db = db;

    public async Task<User> GetOrCreateByEmailAsync(string email, string displayName, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null)
        {
            user = new User { Id = Guid.NewGuid(), Email = email, DisplayName = displayName, CreatedAt = DateTime.UtcNow };
            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        return user;
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
}