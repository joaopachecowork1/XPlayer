namespace XPlayer.Api.Models;

public record SessionDto(
    Guid Id,
    Guid UserId,
    string GameId,
    string GameName,
    string? CoverUrl,
    string? Released,
    int? Score,
    string? Platform,
    DateTimeOffset StartedAt,
    DateTimeOffset? EndedAt,
    int? DurationSeconds,
    int? XpEarned,
    SessionStatus Status
);

public record BacklogGameDto(
    Guid UserId,
    string GameId,
    string GameName,
    string? CoverUrl,
    string? Released,
    int? Score,
    int TotalPlaySeconds,
    int TotalXp,
    int SessionsCount,
    DateTimeOffset? LastPlayedAt
);

public record StartSessionRequest(
    string GameId,
    string GameName,
    string? CoverUrl,
    string? Released,
    string? Platform,
    DateTimeOffset? StartedAt,
    int? Score
);

public record StopSessionRequest(
    DateTimeOffset? EndedAt
);

// ------------------------------
// Canhões do Ano (fun awards)
// ------------------------------

public record AwardCategoryDto(
    string Id,
    string Name,
    int SortOrder,
    bool IsActive,
    string Kind,
    string? Description,
    string? VoteQuestion,
    string? VoteRules
);

public record CreateAwardCategoryRequest(
    string Name,
    int? SortOrder,
    string Kind,
    string? Description,
    string? VoteQuestion,
    string? VoteRules
);

public record UpdateAwardCategoryRequest(
    string? Name,
    int? SortOrder,
    bool? IsActive,
    string? Kind,
    string? Description,
    string? VoteQuestion,
    string? VoteRules
);

public record PublicUserDto(Guid Id, string Email, string? DisplayName, bool IsAdmin);

public record MeDto(PublicUserDto User);

public record UserVoteDto(string Id, string CategoryId, Guid VoterUserId, Guid TargetUserId, DateTimeOffset UpdatedAtUtc);

public record CastUserVoteRequest(string CategoryId, Guid TargetUserId);

public record NomineeDto(
    string Id,
    string? CategoryId,
    string Title,
    string? ImageUrl,
    string Status,
    DateTimeOffset CreatedAtUtc
);

public record CreateNomineeRequest(
    string? CategoryId,
    string Title,
    string? TargetUserId
);

public record CategoryProposalDto(string Id, string Name, string? Description, string Status, DateTimeOffset CreatedAtUtc);

public record CreateCategoryProposalRequest(string Name, string? Description);

public record GalaMeasureDto(string Id, string Text, bool IsActive, DateTimeOffset CreatedAtUtc);

public record MeasureProposalDto(string Id, string Text, string Status, DateTimeOffset CreatedAtUtc);

public record CreateMeasureProposalRequest(string Text);

public record PendingAdminDto(
    List<NomineeDto> Nominees,
    List<CategoryProposalDto> CategoryProposals,
    List<MeasureProposalDto> MeasureProposals
);

public record SetNomineeCategoryRequest(string? CategoryId);

public record CanhoesResultNomineeDto(
    string NomineeId,
    string? CategoryId,
    string Title,
    string? ImageUrl,
    int Votes
);

public record CanhoesCategoryResultDto(
    string CategoryId,
    string CategoryName,
    int TotalVotes,
    List<CanhoesResultNomineeDto> Top
);

public record VoteDto(string Id, string CategoryId, string NomineeId, Guid UserId, DateTimeOffset UpdatedAtUtc);

public record CastVoteRequest(string CategoryId, string NomineeId);

public record CanhoesEventStateDto(string Phase, bool NominationsVisible, bool ResultsVisible);


public record WishlistItemDto(
    string Id,
    Guid UserId,
    string Title,
    string? Url,
    string? Notes,
    string? ImageUrl,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc
);

public record CreateWishlistItemRequest(string Title, string? Url, string? Notes);

public record SecretSantaMeDto(
    string DrawId,
    string EventCode,
    PublicUserDto Receiver
);

public record CreateSecretSantaDrawRequest(string? EventCode);

public record SecretSantaDrawDto(string Id, string EventCode, DateTimeOffset CreatedAtUtc, bool IsLocked);

// NOTE: Hub DTOs live in XPlayer.Api.DTOs (HubPostDto, HubCommentDto, polls, requests)
// to keep the API layer clean and avoid name collisions with domain models.
