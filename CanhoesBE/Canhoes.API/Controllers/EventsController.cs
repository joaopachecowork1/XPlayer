using System.Text.Json;
using Canhoes.Api.Auth;
using Canhoes.Api.Data;
using Canhoes.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Canhoes.Api.Controllers;

[ApiController]
[Route("api/v1/events")]
[Authorize]
public sealed class EventsController : ControllerBase
{
    private readonly CanhoesDbContext _db;

    private sealed record EventAccessContext(
        EventEntity Event,
        Guid UserId,
        bool IsAdmin,
        bool IsMember)
    {
        public bool CanAccess => IsAdmin || IsMember;
        public bool CanManage => IsAdmin;
    }

    public EventsController(CanhoesDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lists events ordered by the currently active cycle first.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EventSummaryDto>>> ListEvents(CancellationToken ct)
    {
        var events = await _db.Events
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.Name)
            .ToListAsync(ct);

        return Ok(events.Select(ToEventSummaryDto).ToList());
    }

    [HttpGet("{eventId}")]
    public async Task<ActionResult<EventContextDto>> GetEventContext([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var members = await _db.EventMembers
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .ToListAsync(ct);

        var users = await _db.Users
            .AsNoTracking()
            .Where(x => members.Select(m => m.UserId).Contains(x.Id))
            .ToListAsync(ct);

        var userLookup = users.ToDictionary(x => x.Id);

        var userDtos = members
            .Where(x => userLookup.ContainsKey(x.UserId))
            .OrderByDescending(x => x.Role == EventRoles.Admin)
            .ThenBy(x => userLookup.TryGetValue(x.UserId, out var user) ? GetUserName(user) : x.UserId.ToString())
            .Select(x =>
            {
                var user = userLookup[x.UserId];
                return new EventUserDto(user.Id, GetUserName(user), x.Role);
            })
            .ToList();

        var phaseDtos = await _db.EventPhases
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.StartDateUtc)
            .Select(x => new EventPhaseDto(
                x.Id,
                x.Type,
                new DateTimeOffset(x.StartDateUtc, TimeSpan.Zero),
                new DateTimeOffset(x.EndDateUtc, TimeSpan.Zero),
                x.IsActive
            ))
            .ToListAsync(ct);

        var activePhase = phaseDtos.FirstOrDefault(x => x.IsActive);

        return Ok(new EventContextDto(
            ToEventSummaryDto(access.Event),
            userDtos,
            phaseDtos,
            activePhase
        ));
    }

    /// <summary>
    /// Returns the event shell snapshot used by the home screen and chrome to
    /// decide what the member can see and what action matters next.
    /// </summary>
    [HttpGet("{eventId}/overview")]
    public async Task<ActionResult<EventOverviewDto>> GetEventOverview([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var phases = await _db.EventPhases
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.StartDateUtc)
            .ToListAsync(ct);

        var activePhaseEntity = phases.FirstOrDefault(x => x.IsActive);
        var activePhase = activePhaseEntity is null ? null : ToEventPhaseDto(activePhaseEntity);
        var nextPhase = phases
            .Where(x => activePhaseEntity is null ? x.EndDateUtc >= DateTime.UtcNow : x.StartDateUtc > activePhaseEntity.StartDateUtc)
            .OrderBy(x => x.StartDateUtc)
            .Select(ToEventPhaseDto)
            .FirstOrDefault();
        var legacyState = await _db.CanhoesEventState
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

        var categoryIds = await _db.AwardCategories
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(ct);

        var latestDraw = await GetLatestSecretSantaDrawAsync(ct);
        var hasAssignment = latestDraw is not null && await _db.SecretSantaAssignments
            .AsNoTracking()
            .AnyAsync(x => x.DrawId == latestDraw.Id && x.GiverUserId == access.UserId, ct);

        var myNomineeVotes = categoryIds.Count == 0
            ? 0
            : await _db.Votes
                .AsNoTracking()
                .CountAsync(x => x.UserId == access.UserId && categoryIds.Contains(x.CategoryId), ct);

        var myUserVotes = categoryIds.Count == 0
            ? 0
            : await _db.UserVotes
                .AsNoTracking()
                .CountAsync(x => x.VoterUserId == access.UserId && categoryIds.Contains(x.CategoryId), ct);

        var canSubmitProposal = activePhaseEntity?.Type == EventPhaseTypes.Proposals && IsPhaseOpen(activePhaseEntity);
        var canVote = activePhaseEntity?.Type == EventPhaseTypes.Voting && IsPhaseOpen(activePhaseEntity);

        return Ok(new EventOverviewDto(
            ToEventSummaryDto(access.Event),
            activePhase,
            nextPhase,
            new EventPermissionsDto(
                access.IsAdmin,
                access.IsMember,
                access.CanAccess,
                canSubmitProposal,
                canVote,
                access.CanManage
            ),
            new EventCountsDto(
                await _db.EventMembers.AsNoTracking().CountAsync(x => x.EventId == eventId, ct),
                await _db.HubPosts.AsNoTracking().CountAsync(x => x.EventId == eventId, ct),
                categoryIds.Count,
                await _db.CategoryProposals.AsNoTracking().CountAsync(x => x.EventId == eventId && x.Status == "pending", ct),
                await _db.WishlistItems.AsNoTracking().CountAsync(x => x.EventId == eventId, ct)
            ),
            latestDraw is not null,
            hasAssignment,
            await _db.WishlistItems.AsNoTracking().CountAsync(x => x.EventId == eventId && x.UserId == access.UserId, ct),
            await _db.CategoryProposals.AsNoTracking().CountAsync(x => x.EventId == eventId && x.ProposedByUserId == access.UserId, ct),
            myNomineeVotes + myUserVotes,
            categoryIds.Count,
            BuildModuleVisibility(
                activePhaseEntity,
                latestDraw is not null,
                hasAssignment,
                legacyState,
                access.IsAdmin
            )
        ));
    }

    /// <summary>
    /// Returns the member's voting progress for the active event.
    /// </summary>
    [HttpGet("{eventId}/voting/overview")]
    public async Task<ActionResult<EventVotingOverviewDto>> GetVotingOverview([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var votingPhase = await GetActivePhaseAsync(eventId, EventPhaseTypes.Voting, ct);
        var categoryIds = await _db.AwardCategories
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(ct);

        var submittedNomineeVotes = categoryIds.Count == 0
            ? 0
            : await _db.Votes
                .AsNoTracking()
                .CountAsync(x => x.UserId == access.UserId && categoryIds.Contains(x.CategoryId), ct);

        var submittedUserVotes = categoryIds.Count == 0
            ? 0
            : await _db.UserVotes
                .AsNoTracking()
                .CountAsync(x => x.VoterUserId == access.UserId && categoryIds.Contains(x.CategoryId), ct);

        var submittedVoteCount = submittedNomineeVotes + submittedUserVotes;

        return Ok(new EventVotingOverviewDto(
            eventId,
            votingPhase?.Id,
            IsPhaseOpen(votingPhase),
            votingPhase is null ? null : new DateTimeOffset(votingPhase.EndDateUtc, TimeSpan.Zero),
            categoryIds.Count,
            submittedVoteCount,
            Math.Max(0, categoryIds.Count - submittedVoteCount)
        ));
    }

    /// <summary>
    /// Returns the current member's Secret Santa assignment state plus the
    /// relevant wishlist counts used by the combined secret-santa flow.
    /// </summary>
    [HttpGet("{eventId}/secret-santa/overview")]
    public async Task<ActionResult<EventSecretSantaOverviewDto>> GetSecretSantaOverview([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var latestDraw = await GetLatestSecretSantaDrawAsync(ct);
        if (latestDraw is null)
        {
            return Ok(new EventSecretSantaOverviewDto(
                eventId,
                false,
                false,
                null,
                null,
                0,
                await _db.WishlistItems.AsNoTracking().CountAsync(x => x.EventId == eventId && x.UserId == access.UserId, ct)
            ));
        }

        var assignment = await _db.SecretSantaAssignments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.DrawId == latestDraw.Id && x.GiverUserId == access.UserId, ct);

        EventUserDto? assignedUser = null;
        var assignedWishlistItemCount = 0;

        if (assignment is not null)
        {
            var receiver = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == assignment.ReceiverUserId, ct);

            if (receiver is not null)
            {
                var role = await _db.EventMembers
                    .AsNoTracking()
                    .Where(x => x.EventId == eventId && x.UserId == receiver.Id)
                    .Select(x => x.Role)
                    .FirstOrDefaultAsync(ct)
                    ?? EventRoles.User;

                assignedUser = new EventUserDto(receiver.Id, GetUserName(receiver), role);
                assignedWishlistItemCount = await _db.WishlistItems
                    .AsNoTracking()
                    .CountAsync(x => x.EventId == eventId && x.UserId == receiver.Id, ct);
            }
        }

        return Ok(new EventSecretSantaOverviewDto(
            eventId,
            true,
            assignment is not null && assignedUser is not null,
            latestDraw.EventCode,
            assignedUser,
            assignedWishlistItemCount,
            await _db.WishlistItems.AsNoTracking().CountAsync(x => x.EventId == eventId && x.UserId == access.UserId, ct)
        ));
    }

    [HttpGet("{eventId}/feed/posts")]
    public async Task<ActionResult<List<EventFeedPostDto>>> GetPosts([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var posts = await _db.HubPosts
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderByDescending(x => x.IsPinned)
            .ThenByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);

        var authorIds = posts.Select(x => x.AuthorUserId).Distinct().ToList();
        var authors = await _db.Users
            .AsNoTracking()
            .Where(x => authorIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, ct);

        var dtos = posts.Select(x =>
        {
            var author = authors.TryGetValue(x.AuthorUserId, out var value) ? value : null;
            return new EventFeedPostDto(
                x.Id,
                x.EventId,
                x.AuthorUserId,
                author is null ? "Unknown" : GetUserName(author),
                x.Text,
                x.MediaUrl,
                new DateTimeOffset(x.CreatedAtUtc, TimeSpan.Zero)
            );
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost("{eventId}/feed/posts")]
    public async Task<ActionResult<EventFeedPostDto>> CreatePost(
        [FromRoute] string eventId,
        [FromBody] CreateEventPostRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Content is required.");

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == access.UserId, ct);
        if (user is null) return Unauthorized();

        var mediaUrls = string.IsNullOrWhiteSpace(request.ImageUrl)
            ? []
            : new List<string> { request.ImageUrl.Trim() };

        var post = new HubPostEntity
        {
            Id = Guid.NewGuid().ToString(),
            EventId = eventId,
            AuthorUserId = access.UserId,
            Text = request.Content.Trim(),
            MediaUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            MediaUrlsJson = JsonSerializer.Serialize(mediaUrls),
            CreatedAtUtc = DateTime.UtcNow,
            IsPinned = false
        };

        _db.HubPosts.Add(post);
        await _db.SaveChangesAsync(ct);

        return Ok(new EventFeedPostDto(
            post.Id,
            post.EventId,
            post.AuthorUserId,
            GetUserName(user),
            post.Text,
            post.MediaUrl,
            new DateTimeOffset(post.CreatedAtUtc, TimeSpan.Zero)
        ));
    }

    [HttpGet("{eventId}/categories")]
    public async Task<ActionResult<List<EventCategoryDto>>> GetCategories([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var categories = await _db.AwardCategories
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        return Ok(categories.Select(ToEventCategoryDto).ToList());
    }

    [HttpPost("{eventId}/categories")]
    public async Task<ActionResult<EventCategoryDto>> CreateCategory(
        [FromRoute] string eventId,
        [FromBody] CreateEventCategoryRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanManage) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest("Title is required.");
        if (!Enum.TryParse<AwardCategoryKind>(request.Kind, true, out var kind))
            return BadRequest("Invalid kind.");

        var sortOrder = request.SortOrder
            ?? (await _db.AwardCategories.Where(x => x.EventId == eventId).MaxAsync(x => (int?)x.SortOrder, ct) ?? 0) + 1;

        var category = new AwardCategoryEntity
        {
            Id = Guid.NewGuid().ToString(),
            EventId = eventId,
            Name = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Kind = kind,
            SortOrder = sortOrder,
            IsActive = true
        };

        _db.AwardCategories.Add(category);
        await _db.SaveChangesAsync(ct);

        return Ok(ToEventCategoryDto(category));
    }

    [HttpGet("{eventId}/voting")]
    public async Task<ActionResult<EventVotingBoardDto>> GetVotingBoard([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var votingPhase = await GetActivePhaseAsync(eventId, EventPhaseTypes.Voting, ct);

        var categories = await _db.AwardCategories
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var categoryIds = categories.Select(x => x.Id).ToList();

        var nominees = await _db.Nominees
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.Status == "approved" && x.CategoryId != null && categoryIds.Contains(x.CategoryId))
            .OrderBy(x => x.Title)
            .ToListAsync(ct);

        var members = await _db.EventMembers
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .ToListAsync(ct);

        var memberIds = members.Select(x => x.UserId).ToList();
        var users = await _db.Users
            .AsNoTracking()
            .Where(x => memberIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, ct);

        var nomineeVotes = await _db.Votes
            .AsNoTracking()
            .Where(x => x.UserId == access.UserId && categoryIds.Contains(x.CategoryId))
            .ToDictionaryAsync(x => x.CategoryId, x => x.NomineeId, ct);

        var userVotes = await _db.UserVotes
            .AsNoTracking()
            .Where(x => x.VoterUserId == access.UserId && categoryIds.Contains(x.CategoryId))
            .ToDictionaryAsync(x => x.CategoryId, x => x.TargetUserId.ToString(), ct);

        var categoryDtos = categories.Select(category =>
        {
            List<EventVoteOptionDto> options;
            string? myOptionId;

            if (category.Kind == AwardCategoryKind.UserVote)
            {
                options = members
                    .Where(x => users.ContainsKey(x.UserId))
                    .OrderByDescending(x => x.Role == EventRoles.Admin)
                    .ThenBy(x => GetUserName(users[x.UserId]))
                    .Select(x => new EventVoteOptionDto(
                        x.UserId.ToString(),
                        category.Id,
                        GetUserName(users[x.UserId])
                    ))
                    .ToList();

                myOptionId = userVotes.TryGetValue(category.Id, out var selectedUserId) ? selectedUserId : null;
            }
            else
            {
                options = nominees
                    .Where(x => x.CategoryId == category.Id)
                    .Select(x => new EventVoteOptionDto(x.Id, category.Id, x.Title))
                    .ToList();

                myOptionId = nomineeVotes.TryGetValue(category.Id, out var selectedNomineeId) ? selectedNomineeId : null;
            }

            return new EventVotingCategoryDto(
                category.Id,
                category.EventId,
                category.Name,
                category.Kind.ToString(),
                category.Description,
                category.VoteQuestion,
                options,
                myOptionId
            );
        }).ToList();

        return Ok(new EventVotingBoardDto(
            eventId,
            votingPhase?.Id,
            IsPhaseOpen(votingPhase),
            categoryDtos
        ));
    }

    [HttpPost("{eventId}/votes")]
    public async Task<ActionResult<EventVoteDto>> CastVote(
        [FromRoute] string eventId,
        [FromBody] CreateEventVoteRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var votingPhase = await GetActivePhaseAsync(eventId, EventPhaseTypes.Voting, ct);
        if (!IsPhaseOpen(votingPhase)) return BadRequest("Voting is closed.");

        var category = await _db.AwardCategories
            .FirstOrDefaultAsync(x => x.Id == request.CategoryId && x.EventId == eventId && x.IsActive, ct);

        if (category is null) return BadRequest("Invalid category.");

        if (category.Kind == AwardCategoryKind.UserVote)
        {
            if (!Guid.TryParse(request.OptionId, out var targetUserId))
                return BadRequest("Invalid option.");

            var isMember = await _db.EventMembers
                .AsNoTracking()
                .AnyAsync(x => x.EventId == eventId && x.UserId == targetUserId, ct);

            if (!isMember) return BadRequest("Invalid option.");

            var existingUserVote = await _db.UserVotes
                .FirstOrDefaultAsync(x => x.CategoryId == category.Id && x.VoterUserId == access.UserId, ct);

            if (existingUserVote is null)
            {
                existingUserVote = new UserVoteEntity
                {
                    Id = Guid.NewGuid().ToString(),
                    CategoryId = category.Id,
                    VoterUserId = access.UserId,
                    TargetUserId = targetUserId,
                    UpdatedAtUtc = DateTime.UtcNow
                };
                _db.UserVotes.Add(existingUserVote);
            }
            else
            {
                existingUserVote.TargetUserId = targetUserId;
                existingUserVote.UpdatedAtUtc = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);

            return Ok(new EventVoteDto(
                existingUserVote.Id,
                existingUserVote.VoterUserId,
                existingUserVote.CategoryId,
                existingUserVote.TargetUserId.ToString(),
                votingPhase!.Id
            ));
        }

        var nominee = await _db.Nominees
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == request.OptionId &&
                x.EventId == eventId &&
                x.CategoryId == category.Id &&
                x.Status == "approved", ct);

        if (nominee is null) return BadRequest("Invalid option.");

        var existingVote = await _db.Votes
            .FirstOrDefaultAsync(x => x.CategoryId == category.Id && x.UserId == access.UserId, ct);

        if (existingVote is null)
        {
            existingVote = new VoteEntity
            {
                Id = Guid.NewGuid().ToString(),
                CategoryId = category.Id,
                NomineeId = nominee.Id,
                UserId = access.UserId,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            _db.Votes.Add(existingVote);
        }
        else
        {
            existingVote.NomineeId = nominee.Id;
            existingVote.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        return Ok(new EventVoteDto(
            existingVote.Id,
            existingVote.UserId,
            existingVote.CategoryId,
            existingVote.NomineeId,
            votingPhase!.Id
        ));
    }

    [HttpGet("{eventId}/proposals")]
    public async Task<ActionResult<List<EventProposalDto>>> GetProposals([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var proposals = await _db.CategoryProposals
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(ct);

        return Ok(proposals.Select(ToEventProposalDto).ToList());
    }

    [HttpPost("{eventId}/proposals")]
    public async Task<ActionResult<EventProposalDto>> CreateProposal(
        [FromRoute] string eventId,
        [FromBody] CreateEventProposalRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Content is required.");

        var phase = await GetActivePhaseAsync(eventId, EventPhaseTypes.Proposals, ct);
        if (!IsPhaseOpen(phase)) return BadRequest("Proposals are closed.");

        var proposal = new CategoryProposalEntity
        {
            Id = Guid.NewGuid().ToString(),
            EventId = eventId,
            ProposedByUserId = access.UserId,
            Name = request.Content.Trim(),
            Description = null,
            Status = "pending",
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.CategoryProposals.Add(proposal);
        await _db.SaveChangesAsync(ct);

        return Ok(ToEventProposalDto(proposal));
    }

    [HttpPatch("{eventId}/proposals/{proposalId}")]
    public async Task<ActionResult<EventProposalDto>> UpdateProposal(
        [FromRoute] string eventId,
        [FromRoute] string proposalId,
        [FromBody] UpdateEventProposalRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanManage) return Forbid();

        var proposal = await _db.CategoryProposals
            .FirstOrDefaultAsync(x => x.Id == proposalId && x.EventId == eventId, ct);

        if (proposal is null) return NotFound();
        if (string.IsNullOrWhiteSpace(request.Status)) return BadRequest("Status is required.");

        var status = request.Status.Trim().ToLowerInvariant();
        if (status is not ("pending" or "approved" or "rejected"))
            return BadRequest("Invalid status.");

        proposal.Status = status;

        if (status == "approved")
        {
            var categoryExists = await _db.AwardCategories
                .AsNoTracking()
                .AnyAsync(x => x.EventId == eventId && x.Name == proposal.Name, ct);

            if (!categoryExists)
            {
                var nextSortOrder = (await _db.AwardCategories
                    .Where(x => x.EventId == eventId)
                    .MaxAsync(x => (int?)x.SortOrder, ct) ?? 0) + 1;

                _db.AwardCategories.Add(new AwardCategoryEntity
                {
                    Id = Guid.NewGuid().ToString(),
                    EventId = eventId,
                    Name = proposal.Name,
                    Description = proposal.Description,
                    SortOrder = nextSortOrder,
                    Kind = AwardCategoryKind.Sticker,
                    IsActive = true
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        return Ok(ToEventProposalDto(proposal));
    }

    [HttpGet("{eventId}/wishlist")]
    public async Task<ActionResult<List<EventWishlistItemDto>>> GetWishlist([FromRoute] string eventId, CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();

        var items = await _db.WishlistItems
            .AsNoTracking()
            .Where(x => x.EventId == eventId)
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ToListAsync(ct);

        return Ok(items.Select(x => new EventWishlistItemDto(
            x.Id,
            x.UserId,
            x.EventId,
            x.Title,
            x.Url,
            new DateTimeOffset(x.UpdatedAtUtc, TimeSpan.Zero)
        )).ToList());
    }

    [HttpPost("{eventId}/wishlist")]
    public async Task<ActionResult<EventWishlistItemDto>> CreateWishlistItem(
        [FromRoute] string eventId,
        [FromBody] CreateEventWishlistItemRequest request,
        CancellationToken ct)
    {
        var access = await GetEventAccessAsync(eventId, ct);
        if (access is null) return NotFound();
        if (!access.CanAccess) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Title)) return BadRequest("Title is required.");

        var item = new WishlistItemEntity
        {
            Id = Guid.NewGuid().ToString(),
            EventId = eventId,
            UserId = access.UserId,
            Title = request.Title.Trim(),
            Url = string.IsNullOrWhiteSpace(request.Link) ? null : request.Link.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _db.WishlistItems.Add(item);
        await _db.SaveChangesAsync(ct);

        return Ok(new EventWishlistItemDto(
            item.Id,
            item.UserId,
            item.EventId,
            item.Title,
            item.Url,
            new DateTimeOffset(item.UpdatedAtUtc, TimeSpan.Zero)
        ));
    }

    private async Task<EventAccessContext?> GetEventAccessAsync(string eventId, CancellationToken ct)
    {
        var eventEntity = await _db.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == eventId, ct);

        if (eventEntity is null) return null;

        var userId = HttpContext.GetUserId();
        var isAdmin = HttpContext.IsAdmin();
        var isMember = await _db.EventMembers
            .AsNoTracking()
            .AnyAsync(x => x.EventId == eventId && x.UserId == userId, ct);

        return new EventAccessContext(eventEntity, userId, isAdmin, isMember);
    }

    private Task<EventPhaseEntity?> GetActivePhaseAsync(string eventId, string phaseType, CancellationToken ct) =>
        _db.EventPhases
            .AsNoTracking()
            .Where(x => x.EventId == eventId && x.Type == phaseType && x.IsActive)
            .OrderByDescending(x => x.StartDateUtc)
            .FirstOrDefaultAsync(ct);

    private Task<SecretSantaDrawEntity?> GetLatestSecretSantaDrawAsync(CancellationToken ct)
    {
        // TODO: Secret Santa draws are still keyed by legacy EventCode instead of EventId.
        // Until that model is consolidated, use the latest draw as the active event draw.
        return _db.SecretSantaDraws
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);
    }

    private static bool IsPhaseOpen(EventPhaseEntity? phase)
    {
        if (phase is null || !phase.IsActive) return false;

        var now = DateTime.UtcNow;
        return phase.StartDateUtc <= now && now <= phase.EndDateUtc;
    }

    /// <summary>
    /// Bridges the new phase model with the legacy admin toggles that still
    /// exist in <see cref="CanhoesEventStateEntity"/> until that state is fully
    /// consolidated into the event-scoped model.
    /// </summary>
    private static EventModulesDto BuildModuleVisibility(
        EventPhaseEntity? activePhase,
        bool hasSecretSantaDraw,
        bool hasSecretSantaAssignment,
        CanhoesEventStateEntity? legacyState,
        bool isAdmin)
    {
        var legacyPhase = legacyState?.Phase?.Trim().ToLowerInvariant();
        var nominationsVisible = legacyState?.NominationsVisible ?? false;
        var resultsVisible = legacyState?.ResultsVisible ?? false;
        var activeType = activePhase?.Type;

        var isDrawPhase = activeType == EventPhaseTypes.Draw;
        var isProposalPhase = activeType == EventPhaseTypes.Proposals || legacyPhase == "nominations";
        var isVotingPhase = activeType == EventPhaseTypes.Voting || legacyPhase == "voting";
        var isResultsPhase =
            activeType == EventPhaseTypes.Results ||
            legacyPhase == "gala" ||
            (legacyPhase == "locked" && resultsVisible);

        var proposalModulesVisible = isAdmin || (nominationsVisible && isProposalPhase);
        var resultsModulesVisible = isAdmin || resultsVisible || isResultsPhase;

        return new EventModulesDto(
            Feed: true,
            SecretSanta: isAdmin || isDrawPhase || hasSecretSantaDraw || hasSecretSantaAssignment || isVotingPhase || isResultsPhase,
            Wishlist: true,
            Categories: isAdmin || isProposalPhase || isVotingPhase || resultsModulesVisible,
            Voting: isAdmin || isVotingPhase,
            Gala: resultsModulesVisible,
            Stickers: proposalModulesVisible,
            Measures: proposalModulesVisible,
            Nominees: isAdmin || nominationsVisible || resultsModulesVisible,
            Admin: isAdmin
        );
    }

    private static EventSummaryDto ToEventSummaryDto(EventEntity entity) =>
        new(entity.Id, entity.Name, entity.IsActive);

    private static EventPhaseDto ToEventPhaseDto(EventPhaseEntity entity) =>
        new(
            entity.Id,
            entity.Type,
            new DateTimeOffset(entity.StartDateUtc, TimeSpan.Zero),
            new DateTimeOffset(entity.EndDateUtc, TimeSpan.Zero),
            entity.IsActive
        );

    private static EventCategoryDto ToEventCategoryDto(AwardCategoryEntity entity) =>
        new(entity.Id, entity.EventId, entity.Name, entity.Kind.ToString(), entity.IsActive, entity.Description);

    private static EventProposalDto ToEventProposalDto(CategoryProposalEntity entity) =>
        new(
            entity.Id,
            entity.EventId,
            entity.ProposedByUserId,
            BuildProposalContent(entity),
            entity.Status,
            new DateTimeOffset(entity.CreatedAtUtc, TimeSpan.Zero)
        );

    private static string BuildProposalContent(CategoryProposalEntity entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Description)) return entity.Name;
        return $"{entity.Name}\n\n{entity.Description}";
    }

    private static string GetUserName(UserEntity user) =>
        string.IsNullOrWhiteSpace(user.DisplayName) ? user.Email : user.DisplayName!;
}
