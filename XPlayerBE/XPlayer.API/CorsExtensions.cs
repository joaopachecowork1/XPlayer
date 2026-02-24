using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace XPlayer.Api
{
    public static class CorsExtensions
    {
        private const string PolicyName = "Frontend";

        public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration config)
        {
            var origins = config.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:3000" };
            services.AddCors(opt =>
            {
                opt.AddPolicy(PolicyName, policy =>
                {
                    policy.WithOrigins(origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });
            return services;
        }

        public static IApplicationBuilder UseFrontendCors(this IApplicationBuilder app)
        {
            return app.UseCors(PolicyName);
        }
    }
}