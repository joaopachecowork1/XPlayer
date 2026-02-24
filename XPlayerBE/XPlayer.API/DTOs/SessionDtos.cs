namespace XPlayer.Api.DTOs;

public record SessionStartRequest(string GameExternalId, string GameName);
public record SessionStartResponse(Guid SessionId);
public record HeartbeatRequest(Guid SessionId);
public record SessionPauseRequest(Guid SessionId);
public record SessionResumeRequest(Guid SessionId);
public record SessionStopRequest(Guid SessionId);
public record SessionStopResponse(Guid SessionId, int DurationSeconds, int XpAwarded);

public record SessionHistoryItem(Guid SessionId, string GameId, string GameName, DateTime StartedAt, DateTime? EndedAt, int DurationSeconds, int XpAwarded, string Status);
public record SessionsHistoryResponse(IReadOnlyList<SessionHistoryItem> Items);

public record DailyPoint(DateOnly Day, int ActiveSeconds, int Sessions, int Xp);
public record ByGameItem(string GameId, string GameName, int Sessions, int ActiveSeconds, int Xp);
public record SessionsStatsResponse(int TotalSessions, int TotalActiveSeconds, int AverageSessionLengthSeconds, int TotalXp, int StreakDays, IReadOnlyList<DailyPoint> Daily, IReadOnlyList<ByGameItem> ByGame);

public record DashboardSummary(int TotalXp, int TotalDurationSeconds, int StreakDays);