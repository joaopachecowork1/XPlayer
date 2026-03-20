using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;
using XPlayer.Api.Middleware;
using XPlayer.Api.Startup;
using XPlayer.BL.Interfaces;
using XPlayer.BL.Services;

var builder = WebApplication.CreateBuilder(args);

// Ensure a stable WebRoot so uploads written to "wwwroot" are the same files
// served by UseStaticFiles(). Without this, WebRootPath can vary by host/
// working directory and you'll end up saving files in a folder that's not served.
builder.WebHost.UseWebRoot("wwwroot");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<XPlayerDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=localhost;Initial Catalog=XPlayer;Integrated Security=True;TrustServerCertificate=True;";
    opt.UseSqlServer(cs);
});

builder.Services.AddScoped<ITokenService, TokenService>();

// --- AUTH (Google id_token) ---
var clientId = builder.Configuration["Auth:Google:ClientId"];
// Frontend sends: Authorization: Bearer <Google ID token>
// We validate token and map (sub/email/name) to a local UserEntity in the DB.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        // Google OIDC
        opt.Authority = "https://accounts.google.com";
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = new[] { "https://accounts.google.com", "accounts.google.com" },
            ValidateAudience = !string.IsNullOrWhiteSpace(clientId),
            ValidAudience = builder.Configuration["Auth:Google:ClientId"],
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("dev", p =>
        p.AllowAnyHeader()
         .AllowAnyMethod()
         .AllowAnyOrigin());
});

var app = builder.Build();

// Ensure WebRootPath is set (some VS/hosting setups can leave it null),
// otherwise uploads might be saved under a different folder than StaticFiles serves.
if (string.IsNullOrWhiteSpace(app.Environment.WebRootPath))
{
    app.Environment.WebRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
}

app.UseCors("dev");

// Global error handling – must be first in the middleware pipeline.
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();

// Serve uploaded images (for Canhões do Ano)
app.UseStaticFiles();

app.UseAuthentication();
// Injetamos o nosso Mock SE a flag estiver ativa
var useMockAuth = builder.Configuration.GetValue<bool>("Auth:UseMockAuth");
if (useMockAuth)
{
    app.UseMiddleware<MockAuthMiddleware>();
}
app.UseAuthorization();

// Map authenticated Google user to local DB user (first user becomes admin)
app.UseMiddleware<UserContextMiddleware>();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<XPlayerDbContext>();
    db.Database.EnsureCreated();

    // NOTE: EnsureCreated() does NOT evolve an existing schema.
    // DbSchema applies idempotent DDL patches for new columns / tables.
    DbSchema.EnsureAsync(db).GetAwaiter().GetResult();

    // Seed minimal "Canhões do Ano" state and default data.
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    DbSeeder.Seed(db, env);
}

app.Run();

