using System;
using System.Collections.Generic;

namespace Canhoes.Api.DTOs;

public sealed record HubCommentDto(
    string Id,
    string PostId,
    Guid UserId,
    string UserName,
    string Text,
    DateTime CreatedAtUtc,
    Dictionary<string, int> ReactionCounts,
    List<string> MyReactions
);
