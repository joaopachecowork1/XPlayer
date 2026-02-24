using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.DTOs;
using XPlayer.Api.Models;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/hub")]
[Authorize]
public sealed class HubController : ControllerBase
{
    private readonly XPlayerDbContext _db;
    private readonly IWebHostEnvironment _env;

    public HubController(XPlayerDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ------------------------------
    // Public feed
    // ------------------------------

    
    [HttpGet("posts")]
    public async Task<ActionResult<List<HubPostDto>>> GetPosts([FromQuery] int take = 50, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 200);

        var userId = HttpContext.GetUserId(); // Guid.Empty if not mapped (but [Authorize] should map)

        var posts = await _db.HubPosts
            .AsNoTracking()
            .OrderByDescending(x => x.IsPinned)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Take(take)
            .ToListAsync(ct);

        var postIds = posts.Select(p => p.Id).ToList();

        var commentCounts = await _db.HubPostComments
            .AsNoTracking()
            .Where(x => postIds.Contains(x.PostId))
            .GroupBy(x => x.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PostId, x => x.Count, ct);

        // Reactions
        var reactions = await _db.HubPostReactions
            .AsNoTracking()
            .Where(x => postIds.Contains(x.PostId))
            .Select(x => new { x.PostId, x.UserId, x.Emoji })
            .ToListAsync(ct);

        var reactionCounts = reactions
            .GroupBy(r => (r.PostId, r.Emoji))
            .ToDictionary(g => g.Key, g => g.Count());

        var myReactions = userId == Guid.Empty
            ? new Dictionary<string, List<string>>()
            : reactions
                .Where(r => r.UserId == userId)
                .GroupBy(r => r.PostId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Emoji).Distinct().ToList());

        // Authors
        var authorIds = posts.Select(p => p.AuthorUserId).Distinct().ToList();
        var authors = await _db.Users
            .AsNoTracking()
            .Where(u => authorIds.Contains(u.Id))
            .Select(u => new { u.Id, u.DisplayName, u.Email })
            .ToDictionaryAsync(x => x.Id, x => string.IsNullOrWhiteSpace(x.DisplayName) ? x.Email : x.DisplayName!, ct);

        // Polls
        var polls = await _db.HubPostPolls
            .AsNoTracking()
            .Where(p => postIds.Contains(p.PostId))
            .ToListAsync(ct);

        var pollOptions = await _db.HubPostPollOptions
            .AsNoTracking()
            .Where(o => postIds.Contains(o.PostId))
            .OrderBy(o => o.SortOrder)
            .ToListAsync(ct);

        var pollVotes = await _db.HubPostPollVotes
            .AsNoTracking()
            .Where(v => postIds.Contains(v.PostId))
            .Select(v => new { v.PostId, v.UserId, v.OptionId })
            .ToListAsync(ct);

        var myPollVote = userId == Guid.Empty
            ? new Dictionary<string, string?>()
            : pollVotes
                .Where(v => v.UserId == userId)
                .GroupBy(v => v.PostId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.OptionId).FirstOrDefault());

        var pollCounts = pollVotes
            .GroupBy(v => v.OptionId)
            .ToDictionary(g => g.Key, g => g.Count());

        List<string> ParseMedia(string? mediaUrl, string? mediaUrlsJson)
        {
            var list = new List<string>();
            if (!string.IsNullOrWhiteSpace(mediaUrlsJson))
            {
                try
                {
                    var arr = JsonSerializer.Deserialize<List<string>>(mediaUrlsJson);
                    if (arr is { Count: > 0 }) list.AddRange(arr.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()));
                }
                catch { /* ignore */ }
            }
            if (!string.IsNullOrWhiteSpace(mediaUrl) && !list.Contains(mediaUrl.Trim()))
                list.Insert(0, mediaUrl.Trim());
            return list;
        }

        var dtos = posts.Select(p =>
        {
            var media = ParseMedia(p.MediaUrl, p.MediaUrlsJson);

            HubPollDto? pollDto = null;
            var poll = polls.FirstOrDefault(x => x.PostId == p.Id);
            if (poll is not null)
            {
                var opts = pollOptions.Where(o => o.PostId == p.Id).ToList();
                var myOptId = myPollVote.TryGetValue(p.Id, out var v) ? v : null;
                var optionDtos = opts.Select(o => new HubPollOptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    VoteCount = pollCounts.TryGetValue(o.Id, out var c) ? c : 0
                }).ToList();
                var total = optionDtos.Sum(x => x.VoteCount);
                pollDto = new HubPollDto
                {
                    Question = poll.Question,
                    Options = optionDtos,
                    MyOptionId = myOptId,
                    TotalVotes = total
                };
            }

            var counts = reactions
                .Where(r => r.PostId == p.Id)
                .GroupBy(r => r.Emoji)
                .ToDictionary(g => g.Key, g => g.Count());

            var mine = myReactions.TryGetValue(p.Id, out var mr) ? mr : new List<string>();
            var likedByMe = mine.Contains("❤️");
            var likeCount = counts.TryGetValue("❤️", out var lc) ? lc : 0;

            return new HubPostDto
            {
                Id = p.Id,
                AuthorUserId = p.AuthorUserId.ToString(),
                AuthorName = authors.TryGetValue(p.AuthorUserId, out var n) ? n : "Unknown",
                Text = p.Text,
                MediaUrl = p.MediaUrl,
                MediaUrls = media,
                IsPinned = p.IsPinned,
                CreatedAtUtc = p.CreatedAtUtc,
                LikeCount = likeCount,
                CommentCount = commentCounts.TryGetValue(p.Id, out var cc) ? cc : 0,
                ReactionCounts = counts,
                MyReactions = mine,
                LikedByMe = likedByMe,
                Poll = pollDto
            };
        }).ToList();

        return Ok(dtos);
    }


    
    [HttpPost("posts")]
    public async Task<ActionResult<HubPostDto>> CreatePost([FromBody] CreateHubPostRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Text)) return BadRequest("Text is required.");

        var userId = HttpContext.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var mediaUrls = (req.MediaUrls ?? new List<string>())
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => s.Trim())
            .Distinct()
            .Take(10)
            .ToList();

        // Backwards compatible single URL
        if (!string.IsNullOrWhiteSpace(req.MediaUrl) && !mediaUrls.Contains(req.MediaUrl.Trim()))
            mediaUrls.Insert(0, req.MediaUrl.Trim());

        // Optional poll (single choice)
        var pollQuestion = string.IsNullOrWhiteSpace(req.PollQuestion) ? null : req.PollQuestion.Trim();
        var pollOptions = (req.PollOptions ?? new List<string>())
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => s.Trim())
            .Distinct()
            .Take(8)
            .ToList();

        if (pollQuestion is not null)
        {
            if (pollQuestion.Length > 512) pollQuestion = pollQuestion[..512];
            if (pollOptions.Count < 2) return BadRequest("Poll must have at least 2 options.");
        }

        var post = new HubPostEntity
        {
            AuthorUserId = userId,
            Text = req.Text.Trim(),
            MediaUrl = mediaUrls.FirstOrDefault(),
            // Always persist a JSON array so we never depend on DB nullability/default constraints.
            MediaUrlsJson = JsonSerializer.Serialize(mediaUrls),
            IsPinned = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.HubPosts.Add(post);
        await _db.SaveChangesAsync(ct);

        // Create poll rows after we have a post id
        HubPollDto? pollDto = null;
        if (pollQuestion is not null)
        {
            _db.HubPostPolls.Add(new HubPostPollEntity
            {
                PostId = post.Id,
                Question = pollQuestion,
                CreatedAtUtc = DateTime.UtcNow
            });

            var optionEntities = pollOptions
                .Select((t, i) => new HubPostPollOptionEntity
                {
                    PostId = post.Id,
                    Text = t.Length > 256 ? t[..256] : t,
                    SortOrder = i
                })
                .ToList();

            _db.HubPostPollOptions.AddRange(optionEntities);
            await _db.SaveChangesAsync(ct);

            pollDto = new HubPollDto
            {
                Question = pollQuestion,
                Options = optionEntities
                    .Select(o => new HubPollOptionDto { Id = o.Id, Text = o.Text, VoteCount = 0 })
                    .ToList(),
                MyOptionId = null,
                TotalVotes = 0
            };
        }

        // return DTO for convenience (minimal fields)
        var me = await _db.Users.AsNoTracking().Where(u => u.Id == userId)
            .Select(u => string.IsNullOrWhiteSpace(u.DisplayName) ? u.Email : u.DisplayName!)
            .SingleOrDefaultAsync(ct);

        return Ok(new HubPostDto
        {
            Id = post.Id,
            AuthorUserId = post.AuthorUserId.ToString(),
            AuthorName = me ?? "Unknown",
            Text = post.Text,
            MediaUrl = post.MediaUrl,
            MediaUrls = mediaUrls,
            IsPinned = post.IsPinned,
            CreatedAtUtc = post.CreatedAtUtc,
            LikeCount = 0,
            CommentCount = 0,
            ReactionCounts = new Dictionary<string, int>(),
            MyReactions = new List<string>(),
            LikedByMe = false,
            Poll = pollDto
        });
    }


    [HttpGet("posts/{postId}/comments")]
    public async Task<ActionResult<List<HubCommentDto>>> GetComments([FromRoute] string postId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(postId)) return BadRequest();

        var comments = await _db.HubPostComments
            .AsNoTracking()
            .Where(x => x.PostId == postId)
            .OrderBy(x => x.CreatedAtUtc)
            .ToListAsync(ct);

        var userIds = comments.Select(c => c.UserId).Distinct().ToList();
        var users = await _db.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.DisplayName, u.Email })
            .ToDictionaryAsync(x => x.Id, x => string.IsNullOrWhiteSpace(x.DisplayName) ? x.Email : x.DisplayName!, ct);

        var dtos = comments.Select(c => new HubCommentDto(
            c.Id,
            c.PostId,
            c.UserId,
            users.TryGetValue(c.UserId, out var n) ? n : "Unknown",
            c.Text,
            c.CreatedAtUtc
        )).ToList();

        return Ok(dtos);
    }

    [HttpPost("posts/{postId}/comments")]
    public async Task<ActionResult<HubCommentDto>> CreateComment([FromRoute] string postId, [FromBody] CreateHubCommentRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(postId)) return BadRequest("postId is required.");
        if (string.IsNullOrWhiteSpace(req.Text)) return BadRequest("Text is required.");

        var userId = HttpContext.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var postExists = await _db.HubPosts.AnyAsync(x => x.Id == postId, ct);
        if (!postExists) return NotFound();

        var comment = new HubPostCommentEntity
        {
            PostId = postId,
            UserId = userId,
            Text = req.Text.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.HubPostComments.Add(comment);
        await _db.SaveChangesAsync(ct);

        var me = await _db.Users.AsNoTracking().Where(u => u.Id == userId)
            .Select(u => string.IsNullOrWhiteSpace(u.DisplayName) ? u.Email : u.DisplayName!)
            .SingleOrDefaultAsync(ct);

        return Ok(new HubCommentDto(
            comment.Id,
            comment.PostId,
            comment.UserId,
            me ?? "Unknown",
            comment.Text,
            comment.CreatedAtUtc
        ));
    }


    [HttpPost("uploads")]
    [RequestSizeLimit(25_000_000)] // 25MB
    public async Task<ActionResult<List<string>>> Upload([FromForm] IFormFileCollection files, CancellationToken ct = default)
    {
        if (files is null || files.Count == 0) return BadRequest("No files uploaded.");

        // Save *under* WebRootPath so the files are immediately available via UseStaticFiles().
        // If WebRootPath is ever null (non-standard host), fall back to <ContentRoot>/wwwroot.
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var hubDir = Path.Combine(webRoot, "uploads", "hub");
        Directory.CreateDirectory(hubDir);

        var urls = new List<string>();

        foreach (var f in files.Take(10))
        {
            if (f.Length <= 0) continue;

            var ext = Path.GetExtension(f.FileName);
            if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";

            // naive allowlist
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            if (!allowed.Contains(ext)) continue;

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var abs = Path.Combine(hubDir, fileName);

            await using (var stream = new FileStream(
                abs,
                FileMode.Create,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 1024 * 64,
                useAsync: true))
            {
                await f.CopyToAsync(stream, ct);
                await stream.FlushAsync(ct);
            }

            urls.Add($"/uploads/hub/{fileName}");
        }

        return Ok(urls);
    }

    [HttpPost("posts/{postId}/poll/vote")]
    public async Task<ActionResult<object>> VotePoll([FromRoute] string postId, [FromBody] VotePollRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(postId)) return BadRequest("postId is required.");
        if (req is null || string.IsNullOrWhiteSpace(req.OptionId)) return BadRequest("optionId is required.");

        var userId = HttpContext.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var pollExists = await _db.HubPostPolls.AnyAsync(x => x.PostId == postId, ct);
        if (!pollExists) return NotFound();

        var optionExists = await _db.HubPostPollOptions.AnyAsync(x => x.Id == req.OptionId && x.PostId == postId, ct);
        if (!optionExists) return BadRequest("Invalid optionId.");

        var existing = await _db.HubPostPollVotes.SingleOrDefaultAsync(x => x.PostId == postId && x.UserId == userId, ct);

        if (existing is null)
        {
            _db.HubPostPollVotes.Add(new HubPostPollVoteEntity
            {
                PostId = postId,
                UserId = userId,
                OptionId = req.OptionId.Trim(),
                CreatedAtUtc = DateTime.UtcNow
            });
        }
        else
        {
            existing.OptionId = req.OptionId.Trim();
            existing.CreatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { optionId = req.OptionId.Trim() });
    }


    
    [HttpPost("posts/{postId}/like")]
    public async Task<ActionResult<object>> ToggleLike([FromRoute] string postId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(postId)) return BadRequest("postId is required.");

        var userId = HttpContext.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var postExists = await _db.HubPosts.AnyAsync(x => x.Id == postId, ct);
        if (!postExists) return NotFound();

        const string emoji = "❤️";
        var existing = await _db.HubPostReactions
            .SingleOrDefaultAsync(x => x.PostId == postId && x.UserId == userId && x.Emoji == emoji, ct);

        var liked = existing is null;
        if (existing is null)
        {
            _db.HubPostReactions.Add(new HubPostReactionEntity
            {
                PostId = postId,
                UserId = userId,
                Emoji = emoji,
                CreatedAtUtc = DateTime.UtcNow
            });
        }
        else
        {
            _db.HubPostReactions.Remove(existing);
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { liked });
    }

    [HttpPost("posts/{postId}/reactions")]
    public async Task<ActionResult<object>> ToggleReaction([FromRoute] string postId, [FromBody] ToggleReactionRequest req, CancellationToken ct = default)
    {
        var emoji = string.IsNullOrWhiteSpace(req.Emoji) ? "❤️" : req.Emoji.Trim();
        if (emoji.Length > 16) emoji = emoji.Substring(0, 16);
        return await ToggleReactionInternal(postId, emoji, ct);
    }

    private async Task<ActionResult<object>> ToggleReactionInternal(string postId, string emoji, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(postId)) return BadRequest("postId is required.");

        var userId = HttpContext.GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var postExists = await _db.HubPosts.AnyAsync(x => x.Id == postId, ct);
        if (!postExists) return NotFound();

        var existing = await _db.HubPostReactions
            .SingleOrDefaultAsync(x => x.PostId == postId && x.UserId == userId && x.Emoji == emoji, ct);

        var now = DateTime.UtcNow;

        var active = existing is null;
        if (existing is null)
        {
            _db.HubPostReactions.Add(new HubPostReactionEntity
            {
                PostId = postId,
                UserId = userId,
                Emoji = emoji,
                CreatedAtUtc = now
            });
        }
        else
        {
            _db.HubPostReactions.Remove(existing);
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { emoji, active });
    }


    // ------------------------------
    // Admin moderation
    // ------------------------------

    [HttpPost("admin/posts/{postId}/pin")]
    public async Task<ActionResult> SetPinned([FromRoute] string postId, [FromQuery] bool pinned = true, CancellationToken ct = default)
    {
        if (!HttpContext.IsAdmin()) return Forbid();
        var post = await _db.HubPosts.SingleOrDefaultAsync(x => x.Id == postId, ct);
        if (post is null) return NotFound();

        post.IsPinned = pinned;
        await _db.SaveChangesAsync(ct);
        return Ok(new { pinned = post.IsPinned });
    }

    [HttpDelete("admin/posts/{postId}")]
    public async Task<ActionResult> DeletePost([FromRoute] string postId, CancellationToken ct = default)
    {
        if (!HttpContext.IsAdmin()) return Forbid();

        var post = await _db.HubPosts.SingleOrDefaultAsync(x => x.Id == postId, ct);
        if (post is null) return NotFound();

        // delete children explicitly (no FKs declared)
        var likes = _db.HubPostLikes.Where(x => x.PostId == postId);
        var comments = _db.HubPostComments.Where(x => x.PostId == postId);
        var reactions = _db.HubPostReactions.Where(x => x.PostId == postId);

        _db.HubPostLikes.RemoveRange(likes);
        _db.HubPostComments.RemoveRange(comments);
        _db.HubPostReactions.RemoveRange(reactions);
        _db.HubPosts.Remove(post);

        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("admin/comments/{commentId}")]
    public async Task<ActionResult> DeleteComment([FromRoute] string commentId, CancellationToken ct = default)
    {
        if (!HttpContext.IsAdmin()) return Forbid();

        var c = await _db.HubPostComments.SingleOrDefaultAsync(x => x.Id == commentId, ct);
        if (c is null) return NotFound();

        _db.HubPostComments.Remove(c);
        await _db.SaveChangesAsync(ct);
        return Ok();
    }
}
