using System.Security.Claims;

namespace XPlayer.Api.Auth;

/// <summary>
/// DEV ONLY.
/// Sets a user id for request scoping.
///
/// How it works (simple on purpose):
/// - If Authorization: Bearer <token> is present, we treat the user as logged in.
/// - If X-User-Id header is present, we use it.
/// - Otherwise, we fall back to a configured MockUserId.
///
/// TODO: Replace with real authentication (JWT validation).
/// </summary>
public sealed class MockAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _cfg;

    public MockAuthMiddleware(RequestDelegate next, IConfiguration cfg)
    {
        _next = next;
        _cfg = cfg;
    }

    public async Task Invoke(HttpContext ctx)
    {
        // 1) Prefer explicit header (useful for local testing/tools)
        var headerUserId = ctx.Request.Headers["X-User-Id"].ToString();
        if (Guid.TryParse(headerUserId, out var uidFromHeader))
        {
            ctx.Items["UserId"] = uidFromHeader;
            await _next(ctx);
            return;
        }

        // 2) If there's an auth token, treat as logged-in
        var auth = ctx.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrWhiteSpace(auth) && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            // In the future, parse the token to get the real user id.
            var mock = _cfg["XPlayer:MockUserId"] ?? "11111111-1111-1111-1111-111111111111";
            if (Guid.TryParse(mock, out var mockId))
            {
                ctx.Items["UserId"] = mockId;
                await _next(ctx);
                return;
            }
        }

        // 3) Last resort: still set a mock id (so dev doesn't break)
        var fallback = _cfg["XPlayer:MockUserId"] ?? "11111111-1111-1111-1111-111111111111";
        ctx.Items["UserId"] = Guid.Parse(fallback);

        await _next(ctx);
    }
}
