using System.Collections.Generic;

namespace XPlayer.Api.DTOs;

public sealed class CreateHubPostRequest
{
    public string Text { get; set; } = "";
    // Back-compat for older clients.
    public string? MediaUrl { get; set; }
    public List<string>? MediaUrls { get; set; }

    // Optional poll (single choice, vote can be changed).
    public string? PollQuestion { get; set; }
    public List<string>? PollOptions { get; set; }
}

public sealed class VotePollRequest
{
    public string OptionId { get; set; } = "";
}

public sealed class CreateHubCommentRequest
{
    public string Text { get; set; } = "";
}

public sealed class ToggleReactionRequest
{
    public string? Emoji { get; set; }
}
