using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.Models;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public sealed class UsersController : ControllerBase
{
    private readonly XPlayerDbContext _db;

    public UsersController(XPlayerDbContext db)
    {
        _db = db;
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeDto>> Me(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return Unauthorized();

        return new MeDto(new PublicUserDto(user.Id, user.Email, user.DisplayName, user.IsAdmin));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<PublicUserDto>>> ListUsers(CancellationToken ct)
    {
        var list = await _db.Users.AsNoTracking()
            .OrderBy(u => u.DisplayName)
            .ThenBy(u => u.Email)
            .ToListAsync(ct);

        return list.Select(u => new PublicUserDto(u.Id, u.Email, u.DisplayName, u.IsAdmin)).ToList();
    }

    // Simple admin management (optional; useful for a small private event)
    [HttpPost("users/{id:guid}/set-admin")]
    public async Task<ActionResult<PublicUserDto>> SetAdmin([FromRoute] Guid id, [FromQuery] bool isAdmin, CancellationToken ct)
    {
        if (!HttpContext.IsAdmin()) return Forbid();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound();

        user.IsAdmin = isAdmin;
        await _db.SaveChangesAsync(ct);

        return new PublicUserDto(user.Id, user.Email, user.DisplayName, user.IsAdmin);
    }
}
