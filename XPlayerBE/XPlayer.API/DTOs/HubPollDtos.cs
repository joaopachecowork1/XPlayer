using System.Collections.Generic;

namespace XPlayer.Api.DTOs;

public sealed class HubPollOptionDto
{
    public string Id { get; init; } = "";
    public string Text { get; init; } = "";
    public int VoteCount { get; init; }
}

public sealed class HubPollDto
{
    public string Question { get; init; } = "";
    public List<HubPollOptionDto> Options { get; init; } = new();

    // The option id the current user voted for (or null)
    public string? MyOptionId { get; init; }

    public int TotalVotes { get; init; }
}
