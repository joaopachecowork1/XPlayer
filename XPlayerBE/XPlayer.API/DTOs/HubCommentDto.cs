using System;

namespace XPlayer.Api.DTOs;

public sealed record HubCommentDto(
    string Id,
    string PostId,
    Guid UserId,
    string UserName,
    string Text,
    DateTime CreatedAtUtc
);
