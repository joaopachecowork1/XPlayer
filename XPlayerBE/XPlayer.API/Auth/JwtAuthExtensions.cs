using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace XPlayer.Api.Auth
{
    public static class JwtAuthExtensions
    {
        public static IServiceCollection AddGoogleJwtAuth(this IServiceCollection services, IConfiguration config)
        {
            var clientId = config["Auth:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw new InvalidOperationException("Auth:Google:ClientId is missing.");

            // Important: accept both issuers Google may use
            var validIssuers = new[] { "https://accounts.google.com", "accounts.google.com" };

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = "https://accounts.google.com";
                    options.RequireHttpsMetadata = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuers = validIssuers,
                        ValidateAudience = true,
                        ValidAudience = clientId,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(2)
                    };

                    // Diagnostics: log useful info when auth fails
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            if (string.IsNullOrWhiteSpace(ctx.Token))
                            {
                                ctx.HttpContext.Response.Headers.Append("X-Debug-Auth", "no-bearer-token");
                            }
                            return Task.CompletedTask;
                        },
                        OnAuthenticationFailed = ctx =>
                        {
                            ctx.Response.Headers.Append("X-Debug-Auth", "auth-failed");
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = ctx =>
                        {
                            try
                            {
                                var handler = new JwtSecurityTokenHandler();
                                var jwt = handler.ReadJwtToken((ctx.SecurityToken as JwtSecurityToken)?.RawData ?? string.Empty);
                                var aud = string.Join(",", jwt.Audiences);
                                var sub = jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "";
                                var email = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? "";
                                ctx.HttpContext.Response.Headers.Append("X-Debug-Auth", $"ok;aud={aud};sub={sub};email={email}");
                            }
                            catch
                            {
                                // ignore
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            return services;
        }
    }
}