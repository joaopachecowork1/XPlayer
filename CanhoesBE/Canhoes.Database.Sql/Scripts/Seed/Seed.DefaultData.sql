PRINT N'Applying Canhoes seed data...';
GO

IF NOT EXISTS (SELECT 1 FROM dbo.CanhoesEventState WHERE Id = 1)
BEGIN
    INSERT INTO dbo.CanhoesEventState (Id, Phase, NominationsVisible, ResultsVisible)
    VALUES (1, 'nominations', 1, 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Events WHERE Id = 'canhoes-do-ano')
BEGIN
    INSERT INTO dbo.Events (Id, Name, IsActive, CreatedAtUtc)
    VALUES ('canhoes-do-ano', 'Canhoes do Ano', 1, SYSUTCDATETIME());
END
GO

DECLARE @currentYear INT = YEAR(SYSUTCDATETIME());

MERGE dbo.EventPhases AS target
USING
(
    SELECT
        'phase-draw' AS Id,
        'canhoes-do-ano' AS EventId,
        'DRAW' AS Type,
        DATETIME2FROMPARTS(@currentYear, 1, 1, 0, 0, 0, 0, 0) AS StartDateUtc,
        DATETIME2FROMPARTS(@currentYear, 1, 31, 23, 59, 59, 0, 0) AS EndDateUtc,
        CAST(0 AS BIT) AS IsActive
    UNION ALL
    SELECT
        'phase-proposals',
        'canhoes-do-ano',
        'PROPOSALS',
        DATETIME2FROMPARTS(@currentYear, 2, 1, 0, 0, 0, 0, 0),
        DATETIME2FROMPARTS(@currentYear, 7, 31, 23, 59, 59, 0, 0),
        CAST(1 AS BIT)
    UNION ALL
    SELECT
        'phase-voting',
        'canhoes-do-ano',
        'VOTING',
        DATETIME2FROMPARTS(@currentYear, 8, 1, 0, 0, 0, 0, 0),
        DATETIME2FROMPARTS(@currentYear, 11, 30, 23, 59, 59, 0, 0),
        CAST(0 AS BIT)
    UNION ALL
    SELECT
        'phase-results',
        'canhoes-do-ano',
        'RESULTS',
        DATETIME2FROMPARTS(@currentYear, 12, 1, 0, 0, 0, 0, 0),
        DATETIME2FROMPARTS(@currentYear, 12, 31, 23, 59, 59, 0, 0),
        CAST(0 AS BIT)
) AS source
ON target.EventId = source.EventId
AND target.Type = source.Type
WHEN MATCHED THEN
    UPDATE SET
        target.StartDateUtc = source.StartDateUtc,
        target.EndDateUtc = source.EndDateUtc,
        target.IsActive = source.IsActive
WHEN NOT MATCHED THEN
    INSERT (Id, EventId, Type, StartDateUtc, EndDateUtc, IsActive)
    VALUES (source.Id, source.EventId, source.Type, source.StartDateUtc, source.EndDateUtc, source.IsActive);
GO

UPDATE phase
SET phase.IsActive =
    CASE
        WHEN state.Phase = 'nominations' AND phase.Type = 'PROPOSALS' THEN 1
        WHEN state.Phase = 'voting' AND phase.Type = 'VOTING' THEN 1
        WHEN (state.Phase = 'gala' OR (state.Phase = 'locked' AND state.ResultsVisible = 1)) AND phase.Type = 'RESULTS' THEN 1
        WHEN state.Phase = 'locked' AND ISNULL(state.ResultsVisible, 0) = 0 AND phase.Type = 'DRAW' THEN 1
        ELSE 0
    END
FROM dbo.EventPhases phase
CROSS JOIN dbo.CanhoesEventState state
WHERE phase.EventId = 'canhoes-do-ano'
  AND state.Id = 1;
GO

INSERT INTO dbo.EventMembers (Id, EventId, UserId, Role, JoinedAtUtc)
SELECT
    CONVERT(NVARCHAR(64), NEWID()),
    'canhoes-do-ano',
    userRow.Id,
    CASE WHEN userRow.IsAdmin = 1 THEN 'admin' ELSE 'user' END,
    ISNULL(userRow.CreatedAt, SYSUTCDATETIME())
FROM dbo.Users userRow
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.EventMembers member
    WHERE member.EventId = 'canhoes-do-ano'
      AND member.UserId = userRow.Id
);
GO

UPDATE member
SET member.Role = CASE WHEN userRow.IsAdmin = 1 THEN 'admin' ELSE 'user' END
FROM dbo.EventMembers member
INNER JOIN dbo.Users userRow ON userRow.Id = member.UserId
WHERE member.EventId = 'canhoes-do-ano'
  AND member.Role <> CASE WHEN userRow.IsAdmin = 1 THEN 'admin' ELSE 'user' END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AwardCategories WHERE EventId = 'canhoes-do-ano')
BEGIN
    INSERT INTO dbo.AwardCategories (Id, EventId, Name, SortOrder, Kind, IsActive)
    VALUES
        (CONVERT(NVARCHAR(64), NEWID()), 'canhoes-do-ano', 'Sticker do Ano', 1, 0, 1),
        (CONVERT(NVARCHAR(64), NEWID()), 'canhoes-do-ano', 'Melhor Ano', 10, 1, 1),
        (CONVERT(NVARCHAR(64), NEWID()), 'canhoes-do-ano', 'Alterna do Ano', 11, 1, 1),
        (CONVERT(NVARCHAR(64), NEWID()), 'canhoes-do-ano', 'Aterrado do Ano', 12, 1, 1);
END
GO

PRINT N'Update complete.';
GO
