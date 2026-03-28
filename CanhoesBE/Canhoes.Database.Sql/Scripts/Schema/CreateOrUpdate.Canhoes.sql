PRINT N'Applying Canhoes schema...';
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        ExternalId NVARCHAR(128) NOT NULL CONSTRAINT DF_Users_ExternalId DEFAULT(''),
        Email NVARCHAR(256) NOT NULL,
        DisplayName NVARCHAR(128) NULL,
        IsAdmin BIT NOT NULL CONSTRAINT DF_Users_IsAdmin DEFAULT(0),
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_ExternalId' AND object_id = OBJECT_ID('dbo.Users'))
    CREATE UNIQUE INDEX IX_Users_ExternalId ON dbo.Users(ExternalId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users'))
    CREATE UNIQUE INDEX IX_Users_Email ON dbo.Users(Email);
GO

IF OBJECT_ID('dbo.Events', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Events
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        Name NVARCHAR(128) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Events_IsActive DEFAULT(1),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Events_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Events_IsActive' AND object_id = OBJECT_ID('dbo.Events'))
    CREATE INDEX IX_Events_IsActive ON dbo.Events(IsActive);
GO

IF OBJECT_ID('dbo.EventMembers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EventMembers
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Role NVARCHAR(16) NOT NULL,
        JoinedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_EventMembers_JoinedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EventMembers_EventId_UserId' AND object_id = OBJECT_ID('dbo.EventMembers'))
    CREATE UNIQUE INDEX IX_EventMembers_EventId_UserId ON dbo.EventMembers(EventId, UserId);
GO

IF OBJECT_ID('dbo.EventPhases', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EventPhases
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL,
        Type NVARCHAR(32) NOT NULL,
        StartDateUtc DATETIME2 NOT NULL,
        EndDateUtc DATETIME2 NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_EventPhases_IsActive DEFAULT(0)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EventPhases_EventId_Type' AND object_id = OBJECT_ID('dbo.EventPhases'))
    CREATE UNIQUE INDEX IX_EventPhases_EventId_Type ON dbo.EventPhases(EventId, Type);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EventPhases_EventId_IsActive' AND object_id = OBJECT_ID('dbo.EventPhases'))
    CREATE INDEX IX_EventPhases_EventId_IsActive ON dbo.EventPhases(EventId, IsActive);
GO

IF OBJECT_ID('dbo.AwardCategories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AwardCategories
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_AwardCategories_EventId DEFAULT('canhoes-do-ano'),
        Name NVARCHAR(256) NOT NULL,
        Description NVARCHAR(1000) NULL,
        VoteQuestion NVARCHAR(256) NULL,
        VoteRules NVARCHAR(2000) NULL,
        SortOrder INT NOT NULL CONSTRAINT DF_AwardCategories_SortOrder DEFAULT(0),
        Kind INT NOT NULL CONSTRAINT DF_AwardCategories_Kind DEFAULT(0),
        IsActive BIT NOT NULL CONSTRAINT DF_AwardCategories_IsActive DEFAULT(1)
    );
END
GO

IF COL_LENGTH('dbo.AwardCategories', 'EventId') IS NULL
    ALTER TABLE dbo.AwardCategories ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.AwardCategories', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.AwardCategories SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.AwardCategories', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.AwardCategories')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.AwardCategories ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF COL_LENGTH('dbo.AwardCategories', 'Description') IS NULL
    ALTER TABLE dbo.AwardCategories ADD Description NVARCHAR(1000) NULL;
GO

IF COL_LENGTH('dbo.AwardCategories', 'VoteQuestion') IS NULL
    ALTER TABLE dbo.AwardCategories ADD VoteQuestion NVARCHAR(256) NULL;
GO

IF COL_LENGTH('dbo.AwardCategories', 'VoteRules') IS NULL
    ALTER TABLE dbo.AwardCategories ADD VoteRules NVARCHAR(2000) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AwardCategories_EventId_SortOrder' AND object_id = OBJECT_ID('dbo.AwardCategories'))
    CREATE INDEX IX_AwardCategories_EventId_SortOrder ON dbo.AwardCategories(EventId, SortOrder);
GO

IF OBJECT_ID('dbo.Nominees', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Nominees
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_Nominees_EventId DEFAULT('canhoes-do-ano'),
        CategoryId NVARCHAR(64) NULL,
        Title NVARCHAR(512) NOT NULL,
        ImageUrl NVARCHAR(1024) NULL,
        SubmittedByUserId UNIQUEIDENTIFIER NOT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_Nominees_Status DEFAULT('pending'),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Nominees_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.Nominees', 'EventId') IS NULL
    ALTER TABLE dbo.Nominees ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.Nominees', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.Nominees SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.Nominees', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.Nominees')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.Nominees ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Nominees_CategoryId_Status' AND object_id = OBJECT_ID('dbo.Nominees'))
    CREATE INDEX IX_Nominees_CategoryId_Status ON dbo.Nominees(CategoryId, Status);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Nominees_EventId_Status' AND object_id = OBJECT_ID('dbo.Nominees'))
    CREATE INDEX IX_Nominees_EventId_Status ON dbo.Nominees(EventId, Status);
GO

IF OBJECT_ID('dbo.CategoryProposals', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CategoryProposals
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_CategoryProposals_EventId DEFAULT('canhoes-do-ano'),
        Name NVARCHAR(256) NOT NULL,
        Description NVARCHAR(1000) NULL,
        ProposedByUserId UNIQUEIDENTIFIER NOT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_CategoryProposals_Status DEFAULT('pending'),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_CategoryProposals_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.CategoryProposals', 'EventId') IS NULL
    ALTER TABLE dbo.CategoryProposals ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.CategoryProposals', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.CategoryProposals SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.CategoryProposals', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.CategoryProposals')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.CategoryProposals ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CategoryProposals_Status' AND object_id = OBJECT_ID('dbo.CategoryProposals'))
    CREATE INDEX IX_CategoryProposals_Status ON dbo.CategoryProposals(Status);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CategoryProposals_EventId_Status' AND object_id = OBJECT_ID('dbo.CategoryProposals'))
    CREATE INDEX IX_CategoryProposals_EventId_Status ON dbo.CategoryProposals(EventId, Status);
GO

IF OBJECT_ID('dbo.Measures', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Measures
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_Measures_EventId DEFAULT('canhoes-do-ano'),
        Text NVARCHAR(2000) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Measures_IsActive DEFAULT(1),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Measures_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.Measures', 'EventId') IS NULL
    ALTER TABLE dbo.Measures ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.Measures', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.Measures SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.Measures', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.Measures')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.Measures ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF OBJECT_ID('dbo.MeasureProposals', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MeasureProposals
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_MeasureProposals_EventId DEFAULT('canhoes-do-ano'),
        Text NVARCHAR(2000) NOT NULL,
        ProposedByUserId UNIQUEIDENTIFIER NOT NULL,
        Status NVARCHAR(32) NOT NULL CONSTRAINT DF_MeasureProposals_Status DEFAULT('pending'),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_MeasureProposals_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.MeasureProposals', 'EventId') IS NULL
    ALTER TABLE dbo.MeasureProposals ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.MeasureProposals', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.MeasureProposals SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.MeasureProposals', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.MeasureProposals')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.MeasureProposals ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MeasureProposals_Status' AND object_id = OBJECT_ID('dbo.MeasureProposals'))
    CREATE INDEX IX_MeasureProposals_Status ON dbo.MeasureProposals(Status);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MeasureProposals_EventId_Status' AND object_id = OBJECT_ID('dbo.MeasureProposals'))
    CREATE INDEX IX_MeasureProposals_EventId_Status ON dbo.MeasureProposals(EventId, Status);
GO

IF OBJECT_ID('dbo.Votes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Votes
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        CategoryId NVARCHAR(64) NOT NULL,
        NomineeId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Votes_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Votes_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Votes_CategoryId_UserId' AND object_id = OBJECT_ID('dbo.Votes'))
    CREATE UNIQUE INDEX IX_Votes_CategoryId_UserId ON dbo.Votes(CategoryId, UserId);
GO

IF OBJECT_ID('dbo.UserVotes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserVotes
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        CategoryId NVARCHAR(64) NOT NULL,
        VoterUserId UNIQUEIDENTIFIER NOT NULL,
        TargetUserId UNIQUEIDENTIFIER NOT NULL,
        UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_UserVotes_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserVotes_CategoryId_VoterUserId' AND object_id = OBJECT_ID('dbo.UserVotes'))
    CREATE UNIQUE INDEX IX_UserVotes_CategoryId_VoterUserId ON dbo.UserVotes(CategoryId, VoterUserId);
GO

IF OBJECT_ID('dbo.CanhoesEventState', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CanhoesEventState
    (
        Id INT NOT NULL PRIMARY KEY,
        Phase NVARCHAR(32) NOT NULL,
        NominationsVisible BIT NOT NULL CONSTRAINT DF_CanhoesEventState_NominationsVisible DEFAULT(1),
        ResultsVisible BIT NOT NULL CONSTRAINT DF_CanhoesEventState_ResultsVisible DEFAULT(0)
    );
END
GO

IF OBJECT_ID('dbo.WishlistItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.WishlistItems
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_WishlistItems_EventId DEFAULT('canhoes-do-ano'),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Title NVARCHAR(512) NOT NULL,
        Url NVARCHAR(2048) NULL,
        Notes NVARCHAR(2000) NULL,
        ImageUrl NVARCHAR(1024) NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_WishlistItems_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_WishlistItems_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.WishlistItems', 'EventId') IS NULL
    ALTER TABLE dbo.WishlistItems ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.WishlistItems', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.WishlistItems SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.WishlistItems', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.WishlistItems')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.WishlistItems ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF OBJECT_ID('dbo.SecretSantaDraws', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SecretSantaDraws
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventCode NVARCHAR(128) NOT NULL CONSTRAINT DF_SecretSantaDraws_EventCode DEFAULT('canhoes'),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SecretSantaDraws_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
        CreatedByUserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_SecretSantaDraws_CreatedByUserId DEFAULT('00000000-0000-0000-0000-000000000000'),
        IsLocked BIT NOT NULL CONSTRAINT DF_SecretSantaDraws_IsLocked DEFAULT(1)
    );
END
GO

IF OBJECT_ID('dbo.SecretSantaAssignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SecretSantaAssignments
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        DrawId NVARCHAR(64) NOT NULL,
        GiverUserId UNIQUEIDENTIFIER NOT NULL,
        ReceiverUserId UNIQUEIDENTIFIER NOT NULL
    );
END
GO

IF OBJECT_ID('dbo.HubPosts', 'U') IS NOT NULL
BEGIN
    DECLARE @hubIdType NVARCHAR(128) = (
        SELECT DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'HubPosts' AND COLUMN_NAME = 'Id'
    );

    DECLARE @hubIdMaxLen INT = (
        SELECT CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'HubPosts' AND COLUMN_NAME = 'Id'
    );

    IF (@hubIdType IS NULL) OR (@hubIdType <> 'nvarchar') OR (@hubIdMaxLen <> 64)
    BEGIN
        IF OBJECT_ID('dbo.HubPostCommentReactions', 'U') IS NOT NULL DROP TABLE dbo.HubPostCommentReactions;
        IF OBJECT_ID('dbo.HubPostReactions', 'U') IS NOT NULL DROP TABLE dbo.HubPostReactions;
        IF OBJECT_ID('dbo.HubPostLikes', 'U') IS NOT NULL DROP TABLE dbo.HubPostLikes;
        IF OBJECT_ID('dbo.HubPostComments', 'U') IS NOT NULL DROP TABLE dbo.HubPostComments;
        IF OBJECT_ID('dbo.HubPostPollVotes', 'U') IS NOT NULL DROP TABLE dbo.HubPostPollVotes;
        IF OBJECT_ID('dbo.HubPostPollOptions', 'U') IS NOT NULL DROP TABLE dbo.HubPostPollOptions;
        IF OBJECT_ID('dbo.HubPostPolls', 'U') IS NOT NULL DROP TABLE dbo.HubPostPolls;
        IF OBJECT_ID('dbo.HubPostMedia', 'U') IS NOT NULL DROP TABLE dbo.HubPostMedia;
        DROP TABLE dbo.HubPosts;
    END
END
GO

IF OBJECT_ID('dbo.HubPosts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPosts
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        EventId NVARCHAR(64) NOT NULL CONSTRAINT DF_HubPosts_EventId DEFAULT('canhoes-do-ano'),
        AuthorUserId UNIQUEIDENTIFIER NOT NULL,
        Text NVARCHAR(4000) NOT NULL,
        MediaUrl NVARCHAR(1024) NULL,
        MediaUrlsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_HubPosts_MediaUrlsJson DEFAULT('[]'),
        IsPinned BIT NOT NULL CONSTRAINT DF_HubPosts_IsPinned DEFAULT(0),
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPosts_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.HubPosts', 'EventId') IS NULL
    ALTER TABLE dbo.HubPosts ADD EventId NVARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.HubPosts', 'EventId') IS NOT NULL
    EXEC(N'UPDATE dbo.HubPosts SET EventId = ''canhoes-do-ano'' WHERE EventId IS NULL;');
GO

IF COL_LENGTH('dbo.HubPosts', 'EventId') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.HubPosts')
         AND name = 'EventId'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.HubPosts ALTER COLUMN EventId NVARCHAR(64) NOT NULL;
GO

IF COL_LENGTH('dbo.HubPosts', 'MediaUrl') IS NULL
    ALTER TABLE dbo.HubPosts ADD MediaUrl NVARCHAR(1024) NULL;
GO

IF COL_LENGTH('dbo.HubPosts', 'MediaUrlsJson') IS NULL
    ALTER TABLE dbo.HubPosts ADD MediaUrlsJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_HubPosts_MediaUrlsJson DEFAULT('[]');
GO

IF COL_LENGTH('dbo.HubPosts', 'MediaUrlsJson') IS NOT NULL
    EXEC(N'UPDATE dbo.HubPosts SET MediaUrlsJson = ''[]'' WHERE MediaUrlsJson IS NULL;');
GO

IF COL_LENGTH('dbo.HubPosts', 'MediaUrlsJson') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.HubPosts')
         AND name = 'MediaUrlsJson'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.HubPosts ALTER COLUMN MediaUrlsJson NVARCHAR(MAX) NOT NULL;
GO

IF COL_LENGTH('dbo.HubPosts', 'IsPinned') IS NULL
    ALTER TABLE dbo.HubPosts ADD IsPinned BIT NOT NULL CONSTRAINT DF_HubPosts_IsPinned DEFAULT(0);
GO

IF COL_LENGTH('dbo.HubPosts', 'CreatedAtUtc') IS NULL
    ALTER TABLE dbo.HubPosts ADD CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPosts_CreatedAtUtc DEFAULT SYSUTCDATETIME();
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPosts_EventId' AND object_id = OBJECT_ID('dbo.HubPosts'))
    CREATE INDEX IX_HubPosts_EventId ON dbo.HubPosts(EventId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPosts_CreatedAtUtc' AND object_id = OBJECT_ID('dbo.HubPosts'))
    CREATE INDEX IX_HubPosts_CreatedAtUtc ON dbo.HubPosts(CreatedAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPosts_IsPinned' AND object_id = OBJECT_ID('dbo.HubPosts'))
    CREATE INDEX IX_HubPosts_IsPinned ON dbo.HubPosts(IsPinned);
GO

IF OBJECT_ID('dbo.HubPostLikes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostLikes
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostLikes_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostLikes_PostId_UserId' AND object_id = OBJECT_ID('dbo.HubPostLikes'))
    CREATE UNIQUE INDEX IX_HubPostLikes_PostId_UserId ON dbo.HubPostLikes(PostId, UserId);
GO

IF OBJECT_ID('dbo.HubPostComments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostComments
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Text NVARCHAR(2000) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostComments_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostComments_PostId' AND object_id = OBJECT_ID('dbo.HubPostComments'))
    CREATE INDEX IX_HubPostComments_PostId ON dbo.HubPostComments(PostId);
GO

IF OBJECT_ID('dbo.HubPostReactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostReactions
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Emoji NVARCHAR(16) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostReactions_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostReactions_PostId_UserId_Emoji' AND object_id = OBJECT_ID('dbo.HubPostReactions'))
    CREATE UNIQUE INDEX IX_HubPostReactions_PostId_UserId_Emoji ON dbo.HubPostReactions(PostId, UserId, Emoji);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostReactions_PostId' AND object_id = OBJECT_ID('dbo.HubPostReactions'))
    CREATE INDEX IX_HubPostReactions_PostId ON dbo.HubPostReactions(PostId);
GO

IF OBJECT_ID('dbo.HubPostCommentReactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostCommentReactions
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        CommentId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Emoji NVARCHAR(16) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostCommentReactions_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostCommentReactions_CommentId_UserId_Emoji' AND object_id = OBJECT_ID('dbo.HubPostCommentReactions'))
    CREATE UNIQUE INDEX IX_HubPostCommentReactions_CommentId_UserId_Emoji ON dbo.HubPostCommentReactions(CommentId, UserId, Emoji);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostCommentReactions_CommentId' AND object_id = OBJECT_ID('dbo.HubPostCommentReactions'))
    CREATE INDEX IX_HubPostCommentReactions_CommentId ON dbo.HubPostCommentReactions(CommentId);
GO

IF OBJECT_ID('dbo.HubPostPolls', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostPolls
    (
        PostId NVARCHAR(64) NOT NULL PRIMARY KEY,
        Question NVARCHAR(512) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostPolls_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.HubPostPollOptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostPollOptions
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NOT NULL,
        Text NVARCHAR(256) NOT NULL,
        SortOrder INT NOT NULL CONSTRAINT DF_HubPostPollOptions_SortOrder DEFAULT(0)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostPollOptions_PostId' AND object_id = OBJECT_ID('dbo.HubPostPollOptions'))
    CREATE INDEX IX_HubPostPollOptions_PostId ON dbo.HubPostPollOptions(PostId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostPollOptions_PostId_SortOrder' AND object_id = OBJECT_ID('dbo.HubPostPollOptions'))
    CREATE INDEX IX_HubPostPollOptions_PostId_SortOrder ON dbo.HubPostPollOptions(PostId, SortOrder);
GO

IF OBJECT_ID('dbo.HubPostPollVotes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostPollVotes
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        OptionId NVARCHAR(64) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostPollVotes_CreatedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostPollVotes_PostId_UserId' AND object_id = OBJECT_ID('dbo.HubPostPollVotes'))
    CREATE UNIQUE INDEX IX_HubPostPollVotes_PostId_UserId ON dbo.HubPostPollVotes(PostId, UserId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostPollVotes_PostId' AND object_id = OBJECT_ID('dbo.HubPostPollVotes'))
    CREATE INDEX IX_HubPostPollVotes_PostId ON dbo.HubPostPollVotes(PostId);
GO

IF OBJECT_ID('dbo.HubPostMedia', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HubPostMedia
    (
        Id NVARCHAR(64) NOT NULL PRIMARY KEY,
        PostId NVARCHAR(64) NULL,
        Url NVARCHAR(1024) NOT NULL,
        OriginalFileName NVARCHAR(260) NOT NULL CONSTRAINT DF_HubPostMedia_OriginalFileName DEFAULT(''),
        FileSizeBytes BIGINT NOT NULL CONSTRAINT DF_HubPostMedia_FileSizeBytes DEFAULT(0),
        UploadedByUserId UNIQUEIDENTIFIER NULL,
        ContentType NVARCHAR(128) NULL,
        ContentBytes VARBINARY(MAX) NOT NULL CONSTRAINT DF_HubPostMedia_ContentBytes DEFAULT(0x),
        UploadedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HubPostMedia_UploadedAtUtc DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.HubPostMedia', 'ContentType') IS NULL
    ALTER TABLE dbo.HubPostMedia ADD ContentType NVARCHAR(128) NULL;
GO

IF COL_LENGTH('dbo.HubPostMedia', 'ContentBytes') IS NULL
    ALTER TABLE dbo.HubPostMedia ADD ContentBytes VARBINARY(MAX) NULL;
GO

IF COL_LENGTH('dbo.HubPostMedia', 'ContentBytes') IS NOT NULL
    EXEC(N'UPDATE dbo.HubPostMedia SET ContentBytes = 0x WHERE ContentBytes IS NULL;');
GO

IF COL_LENGTH('dbo.HubPostMedia', 'ContentBytes') IS NOT NULL
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE object_id = OBJECT_ID('dbo.HubPostMedia')
         AND name = 'ContentBytes'
         AND is_nullable = 1
   )
    ALTER TABLE dbo.HubPostMedia ALTER COLUMN ContentBytes VARBINARY(MAX) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostMedia_PostId' AND object_id = OBJECT_ID('dbo.HubPostMedia'))
    CREATE INDEX IX_HubPostMedia_PostId ON dbo.HubPostMedia(PostId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HubPostMedia_Url' AND object_id = OBJECT_ID('dbo.HubPostMedia'))
    CREATE UNIQUE INDEX IX_HubPostMedia_Url ON dbo.HubPostMedia(Url);
GO
