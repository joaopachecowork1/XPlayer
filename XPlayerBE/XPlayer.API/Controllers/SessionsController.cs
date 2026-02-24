using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.Models;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly XPlayerDbContext _db;

    public SessionsController(XPlayerDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SessionDto>>> List([FromQuery] string? gameId, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();

        var q = _db.Sessions.AsNoTracking().Where(s => s.UserId == userId);

        if (!string.IsNullOrWhiteSpace(gameId))
            q = q.Where(s => s.GameId == gameId);

        var list = await q.OrderByDescending(s => s.StartedAt).ToListAsync(ct);

        return list.Select(ToDto).ToList();
    }

    [HttpGet("active")]
    public async Task<ActionResult<SessionDto?>> GetActive(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();

        var s = await _db.Sessions.AsNoTracking()
            .Where(x => x.UserId == userId && (x.Status == SessionStatus.ACTIVE || x.Status == SessionStatus.PAUSED))
            .OrderByDescending(x => x.StartedAt)
            .FirstOrDefaultAsync(ct);

        return s is null ? null : ToDto(s);
    }

    [HttpPost("start")]
    public async Task<ActionResult<SessionDto>> Start([FromBody] StartSessionRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var startedAt = req.StartedAt ?? DateTimeOffset.UtcNow;

        // Create or update cached game metadata (optional but useful)
        var game = await _db.Games.FirstOrDefaultAsync(g => g.Id == req.GameId, ct);
        if (game is null)
        {
            game = new GameEntity
            {
                Id = req.GameId,
                Name = req.GameName,
                CoverUrl = req.CoverUrl,
                Released = req.Released,
                Score = req.Score
            };
            _db.Games.Add(game);
        }
        else
        {
            // Update metadata opportunistically
            game.Name = req.GameName;
            game.CoverUrl = req.CoverUrl ?? game.CoverUrl;
            game.Released = req.Released ?? game.Released;
            game.Score = req.Score ?? game.Score;
        }

        // Ensure backlog item exists
        var backlog = await _db.Backlog.FirstOrDefaultAsync(b => b.UserId == userId && b.GameId == req.GameId, ct);
        if (backlog is null)
        {
            backlog = new BacklogItemEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GameId = req.GameId,
                GameName = req.GameName,
                CoverUrl = req.CoverUrl,
                Released = req.Released,
                Score = req.Score,
                AddedAt = DateTimeOffset.UtcNow
            };
            _db.Backlog.Add(backlog);
        }
        else
        {
            backlog.GameName = req.GameName;
            backlog.CoverUrl = req.CoverUrl ?? backlog.CoverUrl;
            backlog.Released = req.Released ?? backlog.Released;
            backlog.Score = req.Score ?? backlog.Score;
        }

        var session = new SessionEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GameId = req.GameId,
            GameName = req.GameName,
            CoverUrl = req.CoverUrl,
            Released = req.Released,
            Score = req.Score,
            Platform = req.Platform,
            StartedAt = startedAt,
            Status = SessionStatus.ACTIVE,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync(ct);

        return ToDto(session);
    }

    [HttpPost("{id:guid}/stop")]
    public async Task<ActionResult<SessionDto>> Stop([FromRoute] Guid id, [FromBody] StopSessionRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();

        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, ct);
        if (session is null) return NotFound();

        if (session.Status == SessionStatus.COMPLETED)
            return ToDto(session);

        var endedAt = req.EndedAt ?? DateTimeOffset.UtcNow;

        // Compute duration and XP server-side (source of truth)
        var durationSeconds = (int)Math.Max(0, (endedAt - session.StartedAt).TotalSeconds);
        var xp = XpCalculator.CalculateXp(durationSeconds);

        session.EndedAt = endedAt;
        session.DurationSeconds = durationSeconds;
        session.XpEarned = xp;
        session.Status = SessionStatus.COMPLETED;

        // Update backlog aggregates
        var backlog = await _db.Backlog.FirstOrDefaultAsync(b => b.UserId == userId && b.GameId == session.GameId, ct);
        if (backlog is null)
        {
            backlog = new BacklogItemEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GameId = session.GameId,
                GameName = session.GameName,
                CoverUrl = session.CoverUrl,
                TotalPlaySeconds = durationSeconds,
                TotalXp = xp,
                SessionsCount = 1,
                LastPlayedAt = endedAt,
                AddedAt = DateTimeOffset.UtcNow
            };
            _db.Backlog.Add(backlog);
        }
        else
        {
            backlog.TotalPlaySeconds += durationSeconds;
            backlog.TotalXp += xp;
            backlog.SessionsCount += 1;
            backlog.LastPlayedAt = endedAt;
            backlog.GameName = session.GameName;
            backlog.CoverUrl = session.CoverUrl ?? backlog.CoverUrl;
            backlog.Released = session.Released ?? backlog.Released;
            backlog.Score = session.Score ?? backlog.Score;
        }

        await _db.SaveChangesAsync(ct);

        return ToDto(session);
    }

    private static SessionDto ToDto(SessionEntity s) =>
        new(
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
        );
}
