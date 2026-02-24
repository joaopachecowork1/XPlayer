using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/canhoes")]
[Authorize]
public class CanhoesController : ControllerBase
{
    private readonly XPlayerDbContext _db;
    private readonly IWebHostEnvironment _env;

    public CanhoesController(XPlayerDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }


    // 1) NEW DTOs (if you don't already have them)
    public sealed record AdminProposalsHistoryDto(
        ProposalsByStatus<CategoryProposalDto> CategoryProposals,
        ProposalsByStatus<MeasureProposalDto> MeasureProposals
    );
    public sealed record ProposalsByStatus<T>(IEnumerable<T> Approved, IEnumerable<T> Rejected);

    // 2) When approving/rejecting proposals, optionally record the admin user as handler
    //    (add columns ModeratedByUserId, ModeratedAtUtc to CategoryProposalEntity/MeasureProposalEntity if desired)

    // 3) NEW: GET /api/canhoes/admin/proposals
    [HttpGet("admin/proposals")]
    public async Task<ActionResult<AdminProposalsHistoryDto>> AdminProposals(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var catsApproved = await _db.CategoryProposals.AsNoTracking()
            .Where(p => p.Status == "approved")
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        var catsRejected = await _db.CategoryProposals.AsNoTracking()
            .Where(p => p.Status == "rejected")
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        var measApproved = await _db.MeasureProposals.AsNoTracking()
            .Where(p => p.Status == "approved")
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        var measRejected = await _db.MeasureProposals.AsNoTracking()
            .Where(p => p.Status == "rejected")
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        var dto = new AdminProposalsHistoryDto(
            new ProposalsByStatus<CategoryProposalDto>(
                catsApproved.Select(p => new CategoryProposalDto(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero))),
                catsRejected.Select(p => new CategoryProposalDto(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero)))),
            new ProposalsByStatus<MeasureProposalDto>(
                measApproved.Select(p => new MeasureProposalDto(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero))),
                measRejected.Select(p => new MeasureProposalDto(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero))))
        );

        return Ok(dto);
    }

    // ------------------------------
    // Public (authenticated)
    // ------------------------------

    [HttpGet("state")]
    public async Task<ActionResult<CanhoesEventStateDto>> GetState(CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.AsNoTracking().FirstAsync(ct);
        return new CanhoesEventStateDto(state.Phase, state.NominationsVisible, state.ResultsVisible);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<AwardCategoryDto>>> GetCategories(CancellationToken ct)
    {
        var cats = await _db.AwardCategories.AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);
        return cats.Select(c => new AwardCategoryDto(
            c.Id, c.Name, c.SortOrder, c.IsActive, c.Kind.ToString(), c.Description, c.VoteQuestion, c.VoteRules
        )).ToList();
    }

    [HttpGet("nominees")]
    public async Task<ActionResult<List<NomineeDto>>> GetNominees([FromQuery] string? categoryId, CancellationToken ct)
    {
        var q = _db.Nominees.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(categoryId)) q = q.Where(n => n.CategoryId == categoryId);

        // Public list: show approved nominees. If nominations are visible, show approved + pending.
        var state = await _db.CanhoesEventState.AsNoTracking().FirstAsync(ct);
        if (!state.NominationsVisible)
            q = q.Where(n => n.Status == "approved");
        // Never show rejected to non-admins.
        if (!IsAdmin()) q = q.Where(n => n.Status != "rejected");

        var list = await q.OrderByDescending(n => n.CreatedAtUtc).ToListAsync(ct);
        return list.Select(ToNomineeDto).ToList();
    }

    [HttpGet("measures")]
    public async Task<ActionResult<List<GalaMeasureDto>>> GetMeasures(CancellationToken ct)
    {
        var list = await _db.Measures.AsNoTracking().Where(m => m.IsActive)
            .OrderByDescending(m => m.CreatedAtUtc).ToListAsync(ct);
        return list.Select(m => new GalaMeasureDto(m.Id, m.Text, m.IsActive, new DateTimeOffset(m.CreatedAtUtc, TimeSpan.Zero))).ToList();
    }

    [HttpPost("nominees")]
    public async Task<ActionResult<NomineeDto>> CreateNominee([FromBody] CreateNomineeRequest req, CancellationToken ct)
    {
        // Very simple rules:
        // - Anyone can submit while phase == nominations
        // - Starts as pending
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        if (state.Phase != "nominations") return BadRequest("Nominations are closed.");

        var userId = HttpContext.GetUserId();

        // NOTE: TargetUserId is optional (legacy field) and is not persisted.
        // Keep it nullable so older frontends don't fail model-binding.

        var nominee = new NomineeEntity
        {
            Id = Guid.NewGuid().ToString(),
            CategoryId = string.IsNullOrWhiteSpace(req.CategoryId) ? null : req.CategoryId,
            Title = req.Title,
            SubmittedByUserId = userId,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Nominees.Add(nominee);
        await _db.SaveChangesAsync(ct);

        return ToNomineeDto(nominee);
    }

    [HttpPost("categories/proposals")]
    public async Task<ActionResult<CategoryProposalDto>> CreateCategoryProposal([FromBody] CreateCategoryProposalRequest req, CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        if (state.Phase != "nominations") return BadRequest("Category proposals are closed.");

        var userId = HttpContext.GetUserId();
        var p = new CategoryProposalEntity
        {
            Id = Guid.NewGuid().ToString(),
            Name = req.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            ProposedByUserId = userId,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.CategoryProposals.Add(p);
        await _db.SaveChangesAsync(ct);
        return new CategoryProposalDto(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));
    }

    [HttpPost("measures/proposals")]
    public async Task<ActionResult<MeasureProposalDto>> CreateMeasureProposal([FromBody] CreateMeasureProposalRequest req, CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        if (state.Phase != "nominations") return BadRequest("Measure proposals are closed.");

        var userId = HttpContext.GetUserId();
        var p = new MeasureProposalEntity
        {
            Id = Guid.NewGuid().ToString(),
            Text = req.Text.Trim(),
            ProposedByUserId = userId,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.MeasureProposals.Add(p);
        await _db.SaveChangesAsync(ct);
        return new MeasureProposalDto(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));
    }

    [HttpPost("nominees/{id}/upload")]
    [RequestSizeLimit(15_000_000)]
    public async Task<ActionResult<NomineeDto>> UploadNomineeImage([FromRoute] string id, IFormFile file, CancellationToken ct)
    {
        var nominee = await _db.Nominees.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (nominee is null) return NotFound();

        if (file.Length <= 0) return BadRequest("Empty file");

        // Save under wwwroot/uploads/canhoes
        var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "canhoes");
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(file.FileName);
        var safe = $"{id}{ext}";
        var full = Path.Combine(folder, safe);

        await using (var fs = System.IO.File.Create(full))
        {
            await file.CopyToAsync(fs, ct);
        }

        nominee.ImageUrl = $"/uploads/canhoes/{safe}";
        await _db.SaveChangesAsync(ct);

        return ToNomineeDto(nominee);
    }

    [HttpGet("my-votes")]
    public async Task<ActionResult<List<VoteDto>>> GetMyVotes(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var votes = await _db.Votes.AsNoTracking().Where(v => v.UserId == userId).ToListAsync(ct);
        return votes.Select(v => new VoteDto(v.Id, v.CategoryId, v.NomineeId, userId, v.UpdatedAtUtc)).ToList();
    }

    [HttpPost("vote")]
    public async Task<ActionResult<VoteDto>> CastVote([FromBody] CastVoteRequest req, CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        if (state.Phase != "voting") return BadRequest("Voting is closed.");

        var userId = HttpContext.GetUserId();

        // Validate nominee exists and is approved
        var nominee = await _db.Nominees.AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == req.NomineeId && n.CategoryId == req.CategoryId, ct);
        if (nominee is null || nominee.Status != "approved") return BadRequest("Invalid nominee.");

        // Upsert (unique per category per user)
        var existing = await _db.Votes.FirstOrDefaultAsync(v => v.CategoryId == req.CategoryId && v.UserId == userId, ct);
        if (existing is null)
        {
            existing = new VoteEntity
            {
                Id = Guid.NewGuid().ToString(),
                CategoryId = req.CategoryId,
                NomineeId = req.NomineeId,
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.Votes.Add(existing);
        }
        else
        {
            existing.NomineeId = req.NomineeId;
            existing.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return new VoteDto(existing.Id, existing.CategoryId, existing.NomineeId, userId, existing.UpdatedAtUtc);
    }

    [HttpGet("results")]
    public async Task<ActionResult<List<CanhoesCategoryResultDto>>> GetResults(CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.AsNoTracking().FirstAsync(ct);
        if (!(state.ResultsVisible || state.Phase == "gala" || IsAdmin())) return Forbid();

        var categories = await _db.AwardCategories.AsNoTracking().Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ToListAsync(ct);

        var nominees = await _db.Nominees.AsNoTracking().Where(n => n.Status == "approved" && n.CategoryId != null).ToListAsync(ct);
        var votes = await _db.Votes.AsNoTracking().ToListAsync(ct);

        var result = new List<CanhoesCategoryResultDto>();
        foreach (var cat in categories)
        {
            var catNominees = nominees.Where(n => n.CategoryId == cat.Id).ToList();
            var catVotes = votes.Where(v => v.CategoryId == cat.Id).ToList();
            var totalVotes = catVotes.Count;

            var top = catNominees
                .Select(n => new CanhoesResultNomineeDto(
                    n.Id,
                    n.CategoryId,
                    n.Title,
                    n.ImageUrl,
                    catVotes.Count(v => v.NomineeId == n.Id)
                ))
                .OrderByDescending(x => x.Votes)
                .ThenBy(x => x.Title)
                .Take(3)
                .ToList();

            result.Add(new CanhoesCategoryResultDto(cat.Id, cat.Name, totalVotes, top));
        }

        return result;
    }



    // ------------------------------
    // Wishlist (public to authenticated)
    // Everyone can see all wishlists.
    // ------------------------------

    [HttpGet("members")]
    public async Task<ActionResult<List<PublicUserDto>>> GetMembers(CancellationToken ct)
    {
        var list = await _db.Users.AsNoTracking()
            .OrderBy(u => u.DisplayName)
            .ToListAsync(ct);
        return list.Select(u => new PublicUserDto(u.Id, u.Email, u.DisplayName, u.IsAdmin)).ToList();
    }

    [HttpGet("wishlist")]
    public async Task<ActionResult<List<WishlistItemDto>>> GetWishlist(CancellationToken ct)
    {
        var items = await _db.WishlistItems.AsNoTracking()
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ToListAsync(ct);
        return items.Select(x => new WishlistItemDto(
            x.Id, x.UserId, x.Title, x.Url, x.Notes, x.ImageUrl,
            new DateTimeOffset(x.CreatedAtUtc, TimeSpan.Zero),
            new DateTimeOffset(x.UpdatedAtUtc, TimeSpan.Zero)
        )).ToList();
    }

    [HttpPost("wishlist")]
    public async Task<ActionResult<WishlistItemDto>> CreateWishlistItem([FromBody] CreateWishlistItemRequest req, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest("Title is required.");

        var item = new WishlistItemEntity
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            Title = req.Title.Trim(),
            Url = string.IsNullOrWhiteSpace(req.Url) ? null : req.Url.Trim(),
            Notes = string.IsNullOrWhiteSpace(req.Notes) ? null : req.Notes.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
        _db.WishlistItems.Add(item);
        await _db.SaveChangesAsync(ct);

        return new WishlistItemDto(item.Id, item.UserId, item.Title, item.Url, item.Notes, item.ImageUrl,
            new DateTimeOffset(item.CreatedAtUtc, TimeSpan.Zero),
            new DateTimeOffset(item.UpdatedAtUtc, TimeSpan.Zero));
    }

    [HttpPost("wishlist/{id}/upload")]
    [RequestSizeLimit(10_000_000)] // 10MB
    public async Task<IActionResult> UploadWishlistImage([FromRoute] string id, IFormFile file, CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var item = await _db.WishlistItems.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (item is null) return NotFound();
        if (item.UserId != userId && !IsAdmin()) return Forbid();

        if (file is null || file.Length == 0) return BadRequest("File is required.");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".png" or ".jpg" or ".jpeg")) return BadRequest("Only PNG/JPG allowed.");

        var folder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "canhoes", "wishlist");
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var full = Path.Combine(folder, fileName);
        await using (var fs = System.IO.File.Create(full))
        {
            await file.CopyToAsync(fs, ct);
        }

        item.ImageUrl = $"/uploads/canhoes/wishlist/{fileName}";
        item.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    // ------------------------------
    // Secret Santa (draw + "me")
    // ------------------------------

    [HttpPost("secret-santa/draw")]
    public async Task<ActionResult<SecretSantaDrawDto>> AdminDrawSecretSanta(
        [FromBody] CreateSecretSantaDrawRequest req,
        CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var eventCode = string.IsNullOrWhiteSpace(req.EventCode)
            ? $"canhoes{DateTime.UtcNow.Year}"
            : req.EventCode.Trim();

        // ✅ IMPROVEMENT: Apagar TODOS os draws anteriores (não só o primeiro)
        var existingDraws = await _db.SecretSantaDraws
            .Where(x => x.EventCode == eventCode)
            .ToListAsync(ct);

        if (existingDraws.Any())
        {
            foreach (var oldDraw in existingDraws)
            {
                var oldAssignments = _db.SecretSantaAssignments.Where(a => a.DrawId == oldDraw.Id);
                _db.SecretSantaAssignments.RemoveRange(oldAssignments);
            }
            _db.SecretSantaDraws.RemoveRange(existingDraws);
            await _db.SaveChangesAsync(ct);
        }

        // ✅ IMPROVEMENT: Validação de users mínimos
        var users = await _db.Users.AsNoTracking()
            .OrderBy(u => u.Id)
            .ToListAsync(ct);

        if (users.Count < 2)
            return BadRequest("Need at least 2 members to draw.");

        // ✅ IMPROVEMENT: Algoritmo mais robusto (Fisher-Yates shuffle)
        var rng = new Random();
        List<UserEntity> shuffled;
        bool isValid = false;
        int maxAttempts = 100;

        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            // Fisher-Yates shuffle
            shuffled = users.ToList();
            for (int i = shuffled.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                (shuffled[i], shuffled[j]) = (shuffled[j], shuffled[i]);
            }

            // Validar que ninguém tirou a si próprio
            isValid = true;
            for (var i = 0; i < users.Count; i++)
            {
                if (users[i].Id == shuffled[i].Id)
                {
                    isValid = false;
                    break;
                }
            }

            if (isValid)
            {
                // ✅ SUCCESS: Criar o draw
                var draw = new SecretSantaDrawEntity
                {
                    Id = Guid.NewGuid().ToString(),
                    EventCode = eventCode,
                    CreatedAtUtc = DateTime.UtcNow,
                    CreatedByUserId = HttpContext.GetUserId(),
                    IsLocked = true
                };

                _db.SecretSantaDraws.Add(draw);

                // Criar assignments (cada user dá ao próximo)
                for (var i = 0; i < users.Count; i++)
                {
                    _db.SecretSantaAssignments.Add(new SecretSantaAssignmentEntity
                    {
                        Id = Guid.NewGuid().ToString(),
                        DrawId = draw.Id,
                        GiverUserId = users[i].Id,
                        ReceiverUserId = shuffled[i].Id
                    });
                }

                await _db.SaveChangesAsync(ct);

                return new SecretSantaDrawDto(
                    draw.Id,
                    draw.EventCode,
                    new DateTimeOffset(draw.CreatedAtUtc, TimeSpan.Zero),
                    draw.IsLocked
                );
            }
        }

        // Se chegou aqui, falhou após 100 tentativas
        return BadRequest($"Could not create a valid draw after {maxAttempts} attempts. Please try again.");
    }

    [HttpGet("secret-santa/me")]
    public async Task<ActionResult<SecretSantaMeDto>> GetMySecretSanta(
        [FromQuery] string? eventCode,
        CancellationToken ct)
    {
        var code = string.IsNullOrWhiteSpace(eventCode)
            ? $"canhoes{DateTime.UtcNow.Year}"
            : eventCode.Trim();

        // ✅ IMPROVEMENT: Buscar o draw mais recente do evento
        var draw = await _db.SecretSantaDraws
            .AsNoTracking()
            .Where(d => d.EventCode == code)
            .OrderByDescending(d => d.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (draw is null)
            return NotFound(new { message = "No draw exists for this event yet." });

        var userId = HttpContext.GetUserId();

        var assignment = await _db.SecretSantaAssignments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.DrawId == draw.Id && x.GiverUserId == userId, ct);

        if (assignment is null)
            return NotFound(new { message = "You are not part of this draw." });

        var receiver = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == assignment.ReceiverUserId, ct);

        if (receiver is null)
            return NotFound(new { message = "Receiver user not found." });

        return new SecretSantaMeDto(
            draw.Id,
            draw.EventCode,
            new PublicUserDto(receiver.Id, receiver.Email, receiver.DisplayName, receiver.IsAdmin)
        );
    }


    // ------------------------------
    // Admin
    // ------------------------------

    private bool IsAdmin() => HttpContext.IsAdmin();

    // ------------------------------
    // Admin: categories CRUD (portal)
    // ------------------------------

    /// <summary>
    /// Lists all categories (including inactive ones). Used by the admin portal.
    /// </summary>
    [HttpGet("admin/categories")]
    public async Task<ActionResult<List<AwardCategoryDto>>> AdminGetCategories(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var cats = await _db.AwardCategories
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Select(x => new AwardCategoryDto(
                x.Id,
                x.Name,
                x.SortOrder,
                x.IsActive,
                x.Kind.ToString(),
                x.Description,
                x.VoteQuestion,
                x.VoteRules
            ))
            .ToListAsync(ct);

        return Ok(cats);
    }

    /// <summary>
    /// Updates a category (name/sort/isActive/kind/description/voteQuestion/voteRules).
    /// </summary>
    [HttpPatch("admin/categories/{id}")]
    public async Task<ActionResult<AwardCategoryDto>> AdminUpdateCategory(
        [FromRoute] string id,
        [FromBody] UpdateAwardCategoryRequest req,
        CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        if (string.IsNullOrWhiteSpace(id)) return BadRequest("id is required.");

        var cat = await _db.AwardCategories.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (cat is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(req.Name)) cat.Name = req.Name.Trim();
        if (req.SortOrder.HasValue) cat.SortOrder = req.SortOrder.Value;
        if (req.IsActive.HasValue) cat.IsActive = req.IsActive.Value;

        if (!string.IsNullOrWhiteSpace(req.Kind))
        {
            if (Enum.TryParse<AwardCategoryKind>(req.Kind, ignoreCase: true, out var kind))
                cat.Kind = kind;
        }

        if (req.Description is not null) cat.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        if (req.VoteQuestion is not null) cat.VoteQuestion = string.IsNullOrWhiteSpace(req.VoteQuestion) ? null : req.VoteQuestion.Trim();
        if (req.VoteRules is not null) cat.VoteRules = string.IsNullOrWhiteSpace(req.VoteRules) ? null : req.VoteRules.Trim();

        await _db.SaveChangesAsync(ct);

        return Ok(new AwardCategoryDto(
            cat.Id,
            cat.Name,
            cat.SortOrder,
            cat.IsActive,
            cat.Kind.ToString(),
            cat.Description,
            cat.VoteQuestion,
            cat.VoteRules
        ));
    }

    [HttpPost("admin/categories")]
    public async Task<ActionResult<AwardCategoryDto>> AdminCreateCategory([FromBody] CreateAwardCategoryRequest req, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest("Name is required.");
        if (!Enum.TryParse<AwardCategoryKind>(req.Kind, ignoreCase: true, out var kind))
            return BadRequest("Invalid category kind.");

        var maxSort = await _db.AwardCategories.MaxAsync(c => (int?)c.SortOrder, ct) ?? 0;
        var cat = new AwardCategoryEntity
        {
            Id = Guid.NewGuid().ToString(),
            Name = req.Name.Trim(),
            SortOrder = req.SortOrder ?? (maxSort + 1),
            Kind = kind,
            IsActive = true,
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            VoteQuestion = string.IsNullOrWhiteSpace(req.VoteQuestion) ? null : req.VoteQuestion.Trim(),
            VoteRules = string.IsNullOrWhiteSpace(req.VoteRules) ? null : req.VoteRules.Trim()
        };

        _db.AwardCategories.Add(cat);
        await _db.SaveChangesAsync(ct);
        return new AwardCategoryDto(cat.Id, cat.Name, cat.SortOrder, cat.IsActive, cat.Kind.ToString(), cat.Description, cat.VoteQuestion, cat.VoteRules);
    }

    // ------------------------------
    // User votes (vote in a person)
    // ------------------------------

    [HttpGet("my-user-votes")]
    public async Task<ActionResult<List<UserVoteDto>>> GetMyUserVotes(CancellationToken ct)
    {
        var userId = HttpContext.GetUserId();
        var list = await _db.UserVotes.AsNoTracking()
            .Where(v => v.VoterUserId == userId)
            .OrderByDescending(v => v.UpdatedAtUtc)
            .ToListAsync(ct);

        return list.Select(v => new UserVoteDto(v.Id, v.CategoryId, v.VoterUserId, v.TargetUserId, new DateTimeOffset(v.UpdatedAtUtc, TimeSpan.Zero))).ToList();
    }

    [HttpPost("user-vote")]
    public async Task<ActionResult<UserVoteDto>> CastUserVote([FromBody] CastUserVoteRequest req, CancellationToken ct)
    {
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        if (state.Phase != "voting") return BadRequest("Voting is closed.");

        var userId = HttpContext.GetUserId();

        var cat = await _db.AwardCategories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == req.CategoryId, ct);
        if (cat is null || cat.Kind != AwardCategoryKind.UserVote) return BadRequest("Invalid category.");

        var targetExists = await _db.Users.AsNoTracking().AnyAsync(u => u.Id == req.TargetUserId, ct);
        if (!targetExists) return BadRequest("Invalid target user.");

        var existing = await _db.UserVotes.FirstOrDefaultAsync(v => v.CategoryId == req.CategoryId && v.VoterUserId == userId, ct);
        if (existing is null)
        {
            existing = new UserVoteEntity
            {
                Id = Guid.NewGuid().ToString(),
                CategoryId = req.CategoryId,
                VoterUserId = userId,
                TargetUserId = req.TargetUserId,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.UserVotes.Add(existing);
        }
        else
        {
            existing.TargetUserId = req.TargetUserId;
            existing.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return new UserVoteDto(existing.Id, existing.CategoryId, existing.VoterUserId, existing.TargetUserId, new DateTimeOffset(existing.UpdatedAtUtc, TimeSpan.Zero));
    }

    [HttpGet("admin/pending")]
    public async Task<ActionResult<PendingAdminDto>> AdminPending(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var nominees = await _db.Nominees.AsNoTracking().Where(n => n.Status == "pending").OrderByDescending(n => n.CreatedAtUtc).ToListAsync(ct);
        var cats = await _db.CategoryProposals.AsNoTracking().Where(p => p.Status == "pending").OrderByDescending(p => p.CreatedAtUtc).ToListAsync(ct);
        var meas = await _db.MeasureProposals.AsNoTracking().Where(p => p.Status == "pending").OrderByDescending(p => p.CreatedAtUtc).ToListAsync(ct);

        return new PendingAdminDto(
            nominees.Select(ToNomineeDto).ToList(),
            cats.Select(p => new CategoryProposalDto(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero))).ToList(),
            meas.Select(p => new MeasureProposalDto(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero))).ToList()
        );
    }

    [HttpPost("admin/nominees/{id}/set-category")]
    public async Task<ActionResult<NomineeDto>> AdminSetNomineeCategory([FromRoute] string id, [FromBody] SetNomineeCategoryRequest req, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var nominee = await _db.Nominees.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (nominee is null) return NotFound();
        nominee.CategoryId = string.IsNullOrWhiteSpace(req.CategoryId) ? null : req.CategoryId;
        await _db.SaveChangesAsync(ct);
        return ToNomineeDto(nominee);
    }

    [HttpPost("admin/categories/{id}/approve")]
    public async Task<ActionResult<AwardCategoryDto>> ApproveCategoryProposal([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var p = await _db.CategoryProposals.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        p.Status = "approved";

        var maxSort = await _db.AwardCategories.MaxAsync(c => (int?)c.SortOrder, ct) ?? 0;
        var cat = new AwardCategoryEntity
        {
            Id = Guid.NewGuid().ToString(),
            Name = p.Name,
            SortOrder = maxSort + 1,
            IsActive = true
        };
        _db.AwardCategories.Add(cat);
        await _db.SaveChangesAsync(ct);
        return new AwardCategoryDto(cat.Id, cat.Name, cat.SortOrder, cat.IsActive, cat.Kind.ToString(), cat.Description, cat.VoteQuestion, cat.VoteRules);
    }

    [HttpPost("admin/categories/{id}/reject")]
    public async Task<ActionResult<CategoryProposalDto>> RejectCategoryProposal([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var p = await _db.CategoryProposals.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        p.Status = "rejected";
        await _db.SaveChangesAsync(ct);
        return new CategoryProposalDto(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));
    }

    [HttpPost("admin/measures/{id}/approve")]
    public async Task<ActionResult<GalaMeasureDto>> ApproveMeasureProposal([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var p = await _db.MeasureProposals.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        p.Status = "approved";
        var m = new GalaMeasureEntity
        {
            Id = Guid.NewGuid().ToString(),
            Text = p.Text,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.Measures.Add(m);
        await _db.SaveChangesAsync(ct);
        return new GalaMeasureDto(m.Id, m.Text, m.IsActive, new DateTimeOffset(m.CreatedAtUtc, TimeSpan.Zero));
    }

    [HttpPost("admin/measures/{id}/reject")]
    public async Task<ActionResult<MeasureProposalDto>> RejectMeasureProposal([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var p = await _db.MeasureProposals.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        p.Status = "rejected";
        await _db.SaveChangesAsync(ct);
        return new MeasureProposalDto(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));
    }

    [HttpGet("admin/votes")]
    public async Task<ActionResult<object>> AdminVotes(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var votes = await _db.Votes.AsNoTracking().OrderByDescending(v => v.UpdatedAtUtc).ToListAsync(ct);
        return new
        {
            total = votes.Count,
            votes = votes.Select(v => new { v.CategoryId, v.NomineeId, v.UserId, v.UpdatedAtUtc })
        };
    }

    [HttpPost("admin/nominees/{id}/approve")]
    public async Task<ActionResult<NomineeDto>> Approve([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var n = await _db.Nominees.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (n is null) return NotFound();
        if (string.IsNullOrWhiteSpace(n.CategoryId)) return BadRequest("Nominee must have a category before approval.");
        n.Status = "approved";
        await _db.SaveChangesAsync(ct);
        return ToNomineeDto(n);
    }

    [HttpPost("admin/nominees/{id}/reject")]
    public async Task<ActionResult<NomineeDto>> Reject([FromRoute] string id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var n = await _db.Nominees.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (n is null) return NotFound();
        n.Status = "rejected";
        await _db.SaveChangesAsync(ct);
        return ToNomineeDto(n);
    }

    [HttpPost("admin/state")]
    public async Task<ActionResult<CanhoesEventStateDto>> UpdateState([FromBody] CanhoesEventStateDto dto, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();
        var state = await _db.CanhoesEventState.FirstAsync(ct);
        state.Phase = dto.Phase;
        state.NominationsVisible = dto.NominationsVisible;
        state.ResultsVisible = dto.ResultsVisible;
        await _db.SaveChangesAsync(ct);
        return new CanhoesEventStateDto(state.Phase, state.NominationsVisible, state.ResultsVisible);
    }

    private static NomineeDto ToNomineeDto(NomineeEntity n) =>
        new(n.Id, n.CategoryId, n.Title, n.ImageUrl, n.Status, new DateTimeOffset(n.CreatedAtUtc, TimeSpan.Zero));
}
