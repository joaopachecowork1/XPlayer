using System;
using System.Collections.Generic;

namespace XPlayer.Api.DTOs;

public sealed record HubCommentDto(
    string Id,
    string PostId,
    Guid UserId,
    string UserName,
    string Text,
    DateTime CreatedAtUtc,
    Dictionary<string, int>? ReactionCounts = null,
    List<string>? MyReactions = null
);
