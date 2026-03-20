using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Data;

namespace XPlayer.Api.Startup;

/// <summary>
/// Applies incremental, idempotent DDL changes that EnsureCreated() cannot handle
/// (adding new columns to existing tables, schema migrations without EF Migrations).
///
/// Safe to run every startup – every statement is guarded by an existence check.
/// Only runs on SQL Server (the production provider).
/// </summary>
internal static class DbSchema
{
    public static async Task EnsureAsync(XPlayerDbContext db)
    {
        try
        {
            if (!db.Database.IsRelational()) return;

            var provider = db.Database.ProviderName ?? "";
            if (!provider.Contains("SqlServer", StringComparison.OrdinalIgnoreCase)) return;

            await db.Database.ExecuteSqlRawAsync(@"
-- Users: ExternalId + IsAdmin are used by auth middleware.
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
