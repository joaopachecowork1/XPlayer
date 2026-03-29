namespace Canhoes.Api.Models;

public record EventSummaryDto(
    string Id,
    string Name,
    bool IsActive
);

public record EventUserDto(
    Guid Id,
    string Name,
    string Role
);

public record EventPhaseDto(
    string Id,
    string Type,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    bool IsActive
);

public record EventContextDto(
    EventSummaryDto Event,
    List<EventUserDto> Users,
    List<EventPhaseDto> Phases,
    EventPhaseDto? ActivePhase
);

public record EventPermissionsDto(
    bool IsAdmin,
    bool IsMember,
    bool CanPost,
    bool CanSubmitProposal,
    bool CanVote,
    bool CanManage
);

public record EventCountsDto(
    int MemberCount,
    int FeedPostCount,
    int CategoryCount,
    int PendingProposalCount,
    int WishlistItemCount
);

/// <summary>
/// Controls which event modules should be visible to regular members for the
/// current event state. The frontend uses this to keep navigation aligned with
/// the active phase instead of exposing every page all the time.
/// </summary>
public record EventModulesDto(
    bool Feed,
    bool SecretSanta,
    bool Wishlist,
    bool Categories,
    bool Voting,
    bool Gala,
    bool Stickers,
    bool Measures,
    bool Nominees,
    bool Admin
);

/// <summary>
/// Lightweight dashboard payload for the shell and event home. It combines the
/// current phase, member permissions, high-level counts and module visibility.
/// </summary>
public record EventOverviewDto(
    EventSummaryDto Event,
    EventPhaseDto? ActivePhase,
    EventPhaseDto? NextPhase,
    EventPermissionsDto Permissions,
    EventCountsDto Counts,
    bool HasSecretSantaDraw,
    bool HasSecretSantaAssignment,
    int MyWishlistItemCount,
    int MyProposalCount,
    int MyVoteCount,
    int VotingCategoryCount,
    EventModulesDto Modules
);

/// <summary>
/// Summary of the member's current voting progress for the active event.
/// </summary>
public record EventVotingOverviewDto(
    string EventId,
    string? PhaseId,
    bool CanVote,
    DateTimeOffset? EndsAt,
    int CategoryCount,
    int SubmittedVoteCount,
    int RemainingVoteCount
);

/// <summary>
/// Summary of the current member's Secret Santa state, including assignment and
/// wishlist counts for both sides of the pairing when available.
/// </summary>
public record EventSecretSantaOverviewDto(
    string EventId,
    bool HasDraw,
    bool HasAssignment,
    string? DrawEventCode,
    EventUserDto? AssignedUser,
    int AssignedWishlistItemCount,
    int MyWishlistItemCount
);

public record EventFeedPostDto(
    string Id,
    string EventId,
    Guid UserId,
    string UserName,
    string Content,
    string? ImageUrl,
    DateTimeOffset CreatedAt
);

public record CreateEventPostRequest(
    string Content,
    string? ImageUrl
);

public record EventCategoryDto(
    string Id,
    string EventId,
    string Title,
    string Kind,
    bool IsActive,
    string? Description
);

public record CreateEventCategoryRequest(
    string Title,
    string? Description,
    string Kind,
    int? SortOrder
);

public record EventVoteOptionDto(
    string Id,
    string CategoryId,
    string Label
);

public record EventVotingCategoryDto(
    string Id,
    string EventId,
    string Title,
    string Kind,
    string? Description,
    string? VoteQuestion,
    List<EventVoteOptionDto> Options,
    string? MyOptionId
);

public record EventVotingBoardDto(
    string EventId,
    string? PhaseId,
    bool CanVote,
    List<EventVotingCategoryDto> Categories
);

public record CreateEventVoteRequest(
    string CategoryId,
    string OptionId
);

public record EventVoteDto(
    string Id,
    Guid UserId,
    string CategoryId,
    string OptionId,
    string PhaseId
);

public record EventProposalDto(
    string Id,
    string EventId,
    Guid UserId,
    string Content,
    string Status,
    DateTimeOffset CreatedAt
);

public record CreateEventProposalRequest(string Content);

public record UpdateEventProposalRequest(string Status);

public record EventWishlistItemDto(
    string Id,
    Guid UserId,
    string EventId,
    string Title,
    string? Link,
    DateTimeOffset UpdatedAt
);

public record CreateEventWishlistItemRequest(
    string Title,
    string? Link
);
