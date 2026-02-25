using System.IdentityModel.Tokens.Jwt;
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
        // 1. Lemos os valores do ficheiro appsettings
        var mockIdStr = _cfg["Auth:MockUserId"] ?? "11111111-1111-1111-1111-111111111111";
        var mockEmail = _cfg["Auth:MockUserEmail"] ?? "dev@xplayer.com";

        // 2. Criamos as "Claims" (a informação do utilizador falso)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, mockEmail),
            new Claim(JwtRegisteredClaimNames.Email, mockEmail),
            new Claim("displayName", "Mock Admin"),
            // Usamos o ID mockado para preencher a Claim de Identifier
            new Claim(ClaimTypes.NameIdentifier, mockIdStr)
        };

        // 3. Criamos uma identidade "autenticada" e injetamos no contexto do pedido
        var identity = new ClaimsIdentity(claims, "MockAuthScheme");
        ctx.User = new ClaimsPrincipal(identity);

        // 4. Mantemos o ctx.Items para compatibilidade com o teu UserContextMiddleware
        if (Guid.TryParse(mockIdStr, out var mockId))
        {
            ctx.Items["UserId"] = mockId;
        }

        // Passamos a bola ao próximo passo na pipeline
        await _next(ctx);
    }
}
