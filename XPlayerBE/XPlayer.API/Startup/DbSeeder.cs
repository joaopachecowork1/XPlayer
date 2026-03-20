using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Data;
using XPlayer.Api.Models;

namespace XPlayer.Api.Startup;

/// <summary>
/// Seeds the database with the minimum required data on first startup.
/// All operations are idempotent – safe to run on every app start.
/// </summary>
internal static class DbSeeder
{
    public static void Seed(XPlayerDbContext db, IWebHostEnvironment env)
    {
        EnsureCanhoesEventState(db);
        EnsureDefaultAwardCategories(db);
        EnsureUploadDirectories(env);
    }

    private static void EnsureCanhoesEventState(XPlayerDbContext db)
    {
        if (db.CanhoesEventState.Any()) return;

        // EnsureCreated() may not handle IDENTITY_INSERT automatically.
        db.Database.ExecuteSqlRaw(@"
            SET IDENTITY_INSERT CanhoesEventState ON;
            INSERT INTO CanhoesEventState (Id, Phase, NominationsVisible, ResultsVisible)
            VALUES (1, 'nominations', 1, 0);
            SET IDENTITY_INSERT CanhoesEventState OFF;
        ");
    }

    private static void EnsureDefaultAwardCategories(XPlayerDbContext db)
    {
        if (db.AwardCategories.Any()) return;

        db.AwardCategories.AddRange(
            new AwardCategoryEntity { Name = "Sticker do Ano", SortOrder = 1, Kind = AwardCategoryKind.Sticker },
            new AwardCategoryEntity { Name = "Melhor Ano", SortOrder = 10, Kind = AwardCategoryKind.UserVote },
            new AwardCategoryEntity { Name = "Alterna do Ano", SortOrder = 11, Kind = AwardCategoryKind.UserVote },
            new AwardCategoryEntity { Name = "Aterrado do Ano", SortOrder = 12, Kind = AwardCategoryKind.UserVote }
        );
        db.SaveChanges();
    }

    private static void EnsureUploadDirectories(IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? "wwwroot";
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "canhoes"));
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads", "hub"));
    }
}
