using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using XPlayer.Api.Auth;
using XPlayer.Api.Data;

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

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();

// Serve uploaded images (for Canhões do Ano)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Map authenticated Google user to local DB user (first user becomes admin)
app.UseMiddleware<UserContextMiddleware>();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<XPlayerDbContext>();
    db.Database.EnsureCreated();

    // NOTE: EnsureCreated() does NOT evolve an existing schema.
    // Keep a tiny, idempotent schema patcher for dev while we iterate fast.
    DbSchema.EnsureAsync(db).GetAwaiter().GetResult();

    // Seed minimal "Canhões do Ano" state (safe to run multiple times).
    if (!db.CanhoesEventState.Any())
    {
        // Inserir diretamente com SQL incluindo TODAS as colunas obrigatórias
        db.Database.ExecuteSqlRaw(@"
            SET IDENTITY_INSERT CanhoesEventState ON;
            INSERT INTO CanhoesEventState (Id, Phase, NominationsVisible, ResultsVisible) 
            VALUES (1, 'nominations', 1, 0);
            SET IDENTITY_INSERT CanhoesEventState OFF;
        ");
    }

    if (!db.AwardCategories.Any())
    {
        db.AwardCategories.AddRange(new[]
        {
            // Sticker submissions
            new XPlayer.Api.Models.AwardCategoryEntity { Name = "Sticker do Ano", SortOrder = 1, Kind = XPlayer.Api.Models.AwardCategoryKind.Sticker },

            // User voting examples (admins can add/edit from UI)
            new XPlayer.Api.Models.AwardCategoryEntity { Name = "Melhor Ano", SortOrder = 10, Kind = XPlayer.Api.Models.AwardCategoryKind.UserVote },
            new XPlayer.Api.Models.AwardCategoryEntity { Name = "Alterna do Ano", SortOrder = 11, Kind = XPlayer.Api.Models.AwardCategoryKind.UserVote },
            new XPlayer.Api.Models.AwardCategoryEntity { Name = "Aterrado do Ano", SortOrder = 12, Kind = XPlayer.Api.Models.AwardCategoryKind.UserVote },
        });
        db.SaveChanges();
    }

    // Ensure uploads folder exists
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    Directory.CreateDirectory(Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "canhoes"));
    Directory.CreateDirectory(Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "hub"));
}

app.Run();

static class DbSchema
{
    public static async Task EnsureAsync(XPlayerDbContext db)
    {
        try
        {
            // Only run on relational providers.
            if (!db.Database.IsRelational()) return;

            // This project supports both SQLite and SQL Server. The following "ALTER TABLE"
            // statements are SQL Server specific; guard them.
            var provider = db.Database.ProviderName ?? "";
            if (!provider.Contains("SqlServer", StringComparison.OrdinalIgnoreCase)) return;

            // Users: ExternalId + IsAdmin are used by auth middleware.
            await db.Database.ExecuteSqlRawAsync(@"
IF COL_LENGTH('Users', 'ExternalId') IS NULL
BEGIN
  ALTER TABLE Users ADD ExternalId NVARCHAR(128) NOT NULL DEFAULT('');
  CREATE UNIQUE INDEX IX_Users_ExternalId ON Users(ExternalId);
END

IF COL_LENGTH('Users', 'IsAdmin') IS NULL
BEGIN
  ALTER TABLE Users ADD IsAdmin BIT NOT NULL DEFAULT(0);
END

IF COL_LENGTH('Users', 'DisplayName') IS NULL
BEGIN
  ALTER TABLE Users ADD DisplayName NVARCHAR(128) NULL;
END

-- Canhões do Ano - AwardCategories extra fields
IF COL_LENGTH('dbo.AwardCategories', 'Description') IS NULL
BEGIN
  ALTER TABLE AwardCategories ADD Description NVARCHAR(1000) NULL;
END

IF COL_LENGTH('dbo.AwardCategories', 'VoteQuestion') IS NULL
BEGIN
  ALTER TABLE AwardCategories ADD VoteQuestion NVARCHAR(256) NULL;
END

IF COL_LENGTH('dbo.AwardCategories', 'VoteRules') IS NULL
BEGIN
  ALTER TABLE AwardCategories ADD VoteRules NVARCHAR(2000) NULL;
END


-- Hub / Feed
-- If an older dev DB exists with incompatible types (e.g. UNIQUEIDENTIFIER Id),
-- drop Hub tables so the current schema can be recreated consistently.
IF OBJECT_ID('dbo.HubPosts', 'U') IS NOT NULL
BEGIN
  DECLARE @hubIdType NVARCHAR(128) = (
    SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='HubPosts' AND COLUMN_NAME='Id'
  );
  DECLARE @hubIdMaxLen INT = (
    SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='HubPosts' AND COLUMN_NAME='Id'
  );

  IF (@hubIdType IS NULL) OR (@hubIdType <> 'nvarchar') OR (@hubIdMaxLen <> 64)
  BEGIN
    -- Drop children first (order matters)
    IF OBJECT_ID('dbo.HubPostReactions', 'U') IS NOT NULL DROP TABLE dbo.HubPostReactions;
    IF OBJECT_ID('dbo.HubPostLikes', 'U') IS NOT NULL DROP TABLE dbo.HubPostLikes;
    IF OBJECT_ID('dbo.HubPostComments', 'U') IS NOT NULL DROP TABLE dbo.HubPostComments;
    DROP TABLE dbo.HubPosts;
  END
END

IF OBJECT_ID('dbo.HubPosts', 'U') IS NULL
BEGIN
  CREATE TABLE HubPosts (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    AuthorUserId UNIQUEIDENTIFIER NOT NULL,
    Text NVARCHAR(4000) NOT NULL,
    MediaUrl NVARCHAR(1024) NULL,
    -- JSON array of strings.
    MediaUrlsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_HubPosts_MediaUrlsJson DEFAULT('[]'),
    IsPinned BIT NOT NULL DEFAULT(0),
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_HubPosts_CreatedAtUtc ON HubPosts(CreatedAtUtc);
END
ELSE
BEGIN
  IF COL_LENGTH('HubPosts', 'MediaUrlsJson') IS NULL
    ALTER TABLE HubPosts ADD MediaUrlsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_HubPosts_MediaUrlsJson DEFAULT('[]');
  ELSE
  BEGIN
    -- Ensure it's wide enough (NVARCHAR(MAX))
    IF EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA='dbo' AND TABLE_NAME='HubPosts' AND COLUMN_NAME='MediaUrlsJson'
        AND DATA_TYPE='nvarchar' AND CHARACTER_MAXIMUM_LENGTH <> -1
    )
      ALTER TABLE HubPosts ALTER COLUMN MediaUrlsJson NVARCHAR(MAX) NULL;

    -- Ensure NOT NULL + default('[]') for newer app logic.
    UPDATE dbo.HubPosts SET MediaUrlsJson='[]' WHERE MediaUrlsJson IS NULL;
    ALTER TABLE HubPosts ALTER COLUMN MediaUrlsJson NVARCHAR(MAX) NOT NULL;
    IF NOT EXISTS (
      SELECT 1 FROM sys.default_constraints dc
      INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
      INNER JOIN sys.tables t ON t.object_id = c.object_id
      WHERE t.name = 'HubPosts' AND c.name = 'MediaUrlsJson'
    )
      ALTER TABLE HubPosts ADD CONSTRAINT DF_HubPosts_MediaUrlsJson DEFAULT('[]') FOR MediaUrlsJson;
  END
  IF COL_LENGTH('HubPosts', 'MediaUrl') IS NULL
    ALTER TABLE HubPosts ADD MediaUrl NVARCHAR(1024) NULL;
  IF COL_LENGTH('HubPosts', 'IsPinned') IS NULL
    ALTER TABLE HubPosts ADD IsPinned BIT NOT NULL DEFAULT(0);
  IF COL_LENGTH('HubPosts', 'CreatedAtUtc') IS NULL
    ALTER TABLE HubPosts ADD CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME();
END

IF OBJECT_ID('dbo.HubPostComments', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostComments (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    PostId NVARCHAR(64) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Text NVARCHAR(2000) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_HubPostComments_PostId ON HubPostComments(PostId);
END

IF OBJECT_ID('dbo.HubPostLikes', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostLikes (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    PostId NVARCHAR(64) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_HubPostLikes UNIQUE(PostId, UserId)
  );
END

IF OBJECT_ID('dbo.HubPostReactions', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostReactions (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    PostId NVARCHAR(64) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Emoji NVARCHAR(16) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_HubPostReactions UNIQUE(PostId, UserId, Emoji)
  );
  CREATE INDEX IX_HubPostReactions_PostId ON HubPostReactions(PostId);
END

-- Optional polls (single choice)
IF OBJECT_ID('dbo.HubPostPolls', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostPolls (
    PostId NVARCHAR(64) NOT NULL PRIMARY KEY,
    Question NVARCHAR(512) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END

IF OBJECT_ID('dbo.HubPostPollOptions', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostPollOptions (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    PostId NVARCHAR(64) NOT NULL,
    Text NVARCHAR(256) NOT NULL,
    SortOrder INT NOT NULL DEFAULT(0)
  );
  CREATE INDEX IX_HubPostPollOptions_PostId ON HubPostPollOptions(PostId);
END

IF OBJECT_ID('dbo.HubPostPollVotes', 'U') IS NULL
BEGIN
  CREATE TABLE HubPostPollVotes (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    PostId NVARCHAR(64) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    OptionId NVARCHAR(64) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_HubPostPollVotes UNIQUE(PostId, UserId)
  );
  CREATE INDEX IX_HubPostPollVotes_PostId ON HubPostPollVotes(PostId);
END
");
        }
        catch
        {
            // Don't block app startup in dev if schema step fails.
            // The next failing request will surface the real DB error.
        }
    }
}

