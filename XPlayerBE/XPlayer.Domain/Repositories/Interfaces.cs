using XPlayer.Domain.Entities;

namespace XPlayer.Domain.Repositories;

public interface IUserRepository
{
    Task<User> GetOrCreateByEmailAsync(string email, string displayName, CancellationToken ct);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
}
