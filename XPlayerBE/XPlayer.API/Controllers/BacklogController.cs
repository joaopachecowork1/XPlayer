using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.Models;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/backlog")]
[Authorize]
public class BacklogController : ControllerBase
{
    private readonly XPlayerDbContext _db;

    public BacklogController(XPlayerDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<BacklogGameDto>>> List(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var items = await _db.Backlog.AsNoTracking()
            .Where(b => b.UserId == userId)  // ← Filtra pelo userId
            .OrderByDescending(x => x.AddedAt)  // ← Remove .DateTime
            .ToListAsync(ct);

        return items.Select(ToDto).ToList();
    }

    [HttpGet("{gameId}")]
    public async Task<ActionResult<object>> Get([FromRoute] string gameId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();

        var item = await _db.Backlog.AsNoTracking()
            .FirstOrDefaultAsync(b => b.UserId == userId && b.GameId == gameId, ct);

        if (item is null) return NotFound();

        var sessions = await _db.Sessions.AsNoTracking()
            .Where(s => s.UserId == userId && s.GameId == gameId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync(ct);

        return new
        {
            backlog = ToDto(item),
            sessions = sessions.Select(s => new SessionDto(
                s.Id,
                s.UserId,
                s.GameId,
                s.GameName,
                s.CoverUrl,
                s.Released,
                s.Score,
                s.Platform,
                s.StartedAt,
                s.EndedAt,
                s.DurationSeconds,
                s.XpEarned,
                s.Status
            )).ToList()
        };
    }

    private static BacklogGameDto ToDto(BacklogItemEntity b) =>
        new(
            b.UserId,
            b.GameId,
            b.GameName,
            b.CoverUrl,
            b.Released,
            b.Score,
            b.TotalPlaySeconds,
            b.TotalXp,
            b.SessionsCount,
            b.LastPlayedAt
        );
}
