-- Canhões do Ano - Wishlist + Secret Santa (SQL Server)
-- Use EF migrations in real runs. This is a minimal script for local/dev.

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='WishlistItems')
BEGIN
  CREATE TABLE WishlistItems (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(256) NOT NULL,
    Url NVARCHAR(1024) NULL,
    Notes NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(512) NULL,
    CreatedAtUtc DATETIME2 NOT NULL,
    UpdatedAtUtc DATETIME2 NOT NULL
  );
  CREATE INDEX IX_WishlistItems_UserId_CreatedAtUtc ON WishlistItems(UserId, CreatedAtUtc);
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='SecretSantaDraws')
BEGIN
  CREATE TABLE SecretSantaDraws (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    EventCode NVARCHAR(64) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL,
    CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
    IsLocked BIT NOT NULL
  );
  CREATE INDEX IX_SecretSantaDraws_EventCode ON SecretSantaDraws(EventCode);
END

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='SecretSantaAssignments')
BEGIN
  CREATE TABLE SecretSantaAssignments (
    Id NVARCHAR(64) NOT NULL PRIMARY KEY,
    DrawId NVARCHAR(64) NOT NULL,
    GiverUserId UNIQUEIDENTIFIER NOT NULL,
    ReceiverUserId UNIQUEIDENTIFIER NOT NULL
  );
  CREATE UNIQUE INDEX UX_SecretSantaAssignments_Draw_Giver ON SecretSantaAssignments(DrawId, GiverUserId);
  CREATE UNIQUE INDEX UX_SecretSantaAssignments_Draw_Receiver ON SecretSantaAssignments(DrawId, ReceiverUserId);
END
