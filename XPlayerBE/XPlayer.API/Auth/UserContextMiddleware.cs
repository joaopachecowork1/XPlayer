using System.Linq;
using System;
﻿using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Data;
using XPlayer.Api.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace XPlayer.Api.Auth;

/// <summary>
/// Maps the authenticated Google user (JWT id_token) to a local UserEntity in the database.
///
/// Rules (simple by design):
/// - If this is the first user ever created in the DB, they become admin.
/// - Admin status is stored in the DB (UserEntity.IsAdmin).
///
/// Controllers can use HttpContextUserExtensions.GetUserId()/IsAdmin().
/// </summary>
public sealed class UserContextMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserContextMiddleware> _logger;
    private readonly IConfiguration _config;

    public UserContextMiddleware(RequestDelegate next, ILogger<UserContextMiddleware> logger, IConfiguration config)
    {
        _next = next;
        _logger = logger;
        _config = config;
    }

    public async Task Invoke(HttpContext ctx, XPlayerDbContext _db)
    {
        if (ctx.User?.Identity?.IsAuthenticated == true)
        {
            var sub = ctx.User.FindFirst("sub")?.Value
                      ?? ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = ctx.User.FindFirst("email")?.Value
                        ?? ctx.User.FindFirst(ClaimTypes.Email)?.Value;
            var name = ctx.User.FindFirst("name")?.Value
                       ?? ctx.User.FindFirst(ClaimTypes.Name)?.Value
                       ?? email;

            if (!string.IsNullOrWhiteSpace(sub) && !string.IsNullOrWhiteSpace(email))
            {
                // Procura por ExternalId (mais correto) ou Email como fallback
                var user = await _db.Users.FirstOrDefaultAsync(u => u.ExternalId == sub || u.Email == email);

                if (user == null)
                {
                    user = new UserEntity
                    {
                        Id = Guid.NewGuid(),                    // ← ADICIONA ISTO
                        Email = email,
                        DisplayName = name,
                        ExternalId = sub,
                        IsAdmin = !await _db.Users.AnyAsync(), // Primeiro user é admin
                        CreatedAt = DateTime.UtcNow             // ← ADICIONA ISTO
                    };
                    _db.Users.Add(user);
                    await _db.SaveChangesAsync();
                }

                ctx.Items["UserId"] = user.Id;
                ctx.Items["IsAdmin"] = user.IsAdmin;
                // Apply optional admin allowlist (email) from config: Auth:AdminEmails: [ "email1", ... ]
                try
                {
                    var adminEmails = _config.GetSection("Auth:AdminEmails").Get<string[]>() ?? Array.Empty<string>();
                    if (adminEmails.Length > 0 && adminEmails.Any(e => string.Equals(e.Trim(), user.Email, StringComparison.OrdinalIgnoreCase)))
                    {
                        if (!user.IsAdmin)
                        {
                            user.IsAdmin = true;
                            await _db.SaveChangesAsync();
                            _logger.LogInformation("User {Email} promoted to admin via allowlist.", user.Email);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to apply AdminEmails allowlist.");
                }

                _logger.LogDebug("Mapped token -> user: sub={Sub} email={Email} userId={UserId} isAdmin={IsAdmin}", sub, email, user.Id, user.IsAdmin);
    
            }
        }

        await _next(ctx);
    }
}

public static class HttpContextUserExtensions
{
    public static Guid GetUserId(this HttpContext ctx)
    {
        if (ctx.Items.TryGetValue("UserId", out var v) && v is Guid g) return g;
        return Guid.Empty;
    }

    public static bool IsAdmin(this HttpContext ctx)
    {
        if (ctx.Items.TryGetValue("IsAdmin", out var v) && v is bool b) return b;
        return false;
    }
}
