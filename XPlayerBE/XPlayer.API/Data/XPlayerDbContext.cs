using Microsoft.EntityFrameworkCore;
using XPlayer.Api.Models;

namespace XPlayer.Api.Data;

public class XPlayerDbContext : DbContext
{
    public XPlayerDbContext(DbContextOptions<XPlayerDbContext> options) : base(options) { }

    public DbSet<UserEntity> Users => Set<UserEntity>();

    public DbSet<GameEntity> Games => Set<GameEntity>();
    public DbSet<SessionEntity> Sessions => Set<SessionEntity>();
    public DbSet<BacklogItemEntity> Backlog => Set<BacklogItemEntity>();

    // Canhões do Ano
    public DbSet<AwardCategoryEntity> AwardCategories => Set<AwardCategoryEntity>();
    public DbSet<NomineeEntity> Nominees => Set<NomineeEntity>();
    public DbSet<CategoryProposalEntity> CategoryProposals => Set<CategoryProposalEntity>();
    public DbSet<GalaMeasureEntity> Measures => Set<GalaMeasureEntity>();
    public DbSet<MeasureProposalEntity> MeasureProposals => Set<MeasureProposalEntity>();
    public DbSet<VoteEntity> Votes => Set<VoteEntity>();
    public DbSet<UserVoteEntity> UserVotes => Set<UserVoteEntity>();
    public DbSet<WishlistItemEntity> WishlistItems => Set<WishlistItemEntity>();
    public DbSet<SecretSantaDrawEntity> SecretSantaDraws => Set<SecretSantaDrawEntity>();
    public DbSet<SecretSantaAssignmentEntity> SecretSantaAssignments => Set<SecretSantaAssignmentEntity>();
    public DbSet<CanhoesEventStateEntity> CanhoesEventState => Set<CanhoesEventStateEntity>();

    // Hub / Feed
    public DbSet<HubPostEntity> HubPosts => Set<HubPostEntity>();
    public DbSet<HubPostLikeEntity> HubPostLikes => Set<HubPostLikeEntity>();
    public DbSet<HubPostCommentEntity> HubPostComments => Set<HubPostCommentEntity>();
    public DbSet<HubPostReactionEntity> HubPostReactions => Set<HubPostReactionEntity>();

    public DbSet<HubPostPollEntity> HubPostPolls => Set<HubPostPollEntity>();
    public DbSet<HubPostPollOptionEntity> HubPostPollOptions => Set<HubPostPollOptionEntity>();
    public DbSet<HubPostPollVoteEntity> HubPostPollVotes => Set<HubPostPollVoteEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserEntity>()
            .HasIndex(x => x.ExternalId)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<GameEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<SessionEntity>()
            .HasIndex(x => new { x.UserId, x.Status });

        modelBuilder.Entity<SessionEntity>()
            .HasIndex(x => new { x.UserId, x.GameId });

        modelBuilder.Entity<BacklogItemEntity>()
            .HasIndex(x => new { x.UserId, x.GameId })
            .IsUnique();

        modelBuilder.Entity<AwardCategoryEntity>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<NomineeEntity>()
            .HasIndex(x => new { x.CategoryId, x.Status });

        modelBuilder.Entity<CategoryProposalEntity>()
            .HasIndex(x => x.Status);

        modelBuilder.Entity<MeasureProposalEntity>()
            .HasIndex(x => x.Status);

        modelBuilder.Entity<VoteEntity>()
            .HasIndex(x => new { x.CategoryId, x.UserId })
            .IsUnique();

        modelBuilder.Entity<UserVoteEntity>()
            .HasIndex(x => new { x.CategoryId, x.VoterUserId })
            .IsUnique();

        modelBuilder.Entity<CanhoesEventStateEntity>()
            .HasKey(x => x.Id);

        // Hub poll: user can only have one vote per post.
        modelBuilder.Entity<HubPostPollVoteEntity>()
            .HasIndex(x => new { x.PostId, x.UserId })
            .IsUnique();

        modelBuilder.Entity<HubPostPollOptionEntity>()
            .HasIndex(x => new { x.PostId, x.SortOrder });

        // -----------------
        // Hub / Feed
        // -----------------

        modelBuilder.Entity<HubPostEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Text).HasMaxLength(4000);
            e.Property(x => x.MediaUrl).HasMaxLength(1024);
            // JSON array, can be long => NVARCHAR(MAX). Keep default to avoid NULL insert problems.
            e.Property(x => x.MediaUrlsJson)
                .HasColumnType("nvarchar(max)")
                .HasDefaultValue("[]");

            e.HasIndex(x => x.CreatedAtUtc);
            e.HasIndex(x => x.IsPinned);
        });

        modelBuilder.Entity<HubPostCommentEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.PostId).HasMaxLength(64);
            e.Property(x => x.Text).HasMaxLength(2000);
            e.HasIndex(x => x.PostId);
        });

        modelBuilder.Entity<HubPostLikeEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.PostId).HasMaxLength(64);
            e.HasIndex(x => new { x.PostId, x.UserId }).IsUnique();
            e.HasIndex(x => x.PostId);
        });

        modelBuilder.Entity<HubPostReactionEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.PostId).HasMaxLength(64);
            e.Property(x => x.Emoji).HasMaxLength(16);
            e.HasIndex(x => new { x.PostId, x.UserId, x.Emoji }).IsUnique();
            e.HasIndex(x => x.PostId);
        });
    }
}
