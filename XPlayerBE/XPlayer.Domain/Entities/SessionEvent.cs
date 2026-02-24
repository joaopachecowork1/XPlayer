using XPlayer.Domain.Enums;
namespace XPlayer.Domain.Entities;
public class SessionEvent { public Guid Id{get;set;} public Guid SessionId{get;set;} public SessionEventType Type{get;set;} public DateTime OccurredAt{get;set;} }