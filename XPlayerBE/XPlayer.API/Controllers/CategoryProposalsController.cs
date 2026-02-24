
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.DTOs;

namespace App.Controllers
{
    [ApiController]
    [Route("api/categories/{categoryId:long}/proposals")]
    public class CategoryProposalsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoryProposalsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProposalDto>>> List(long categoryId)
        {
            var items = await _db.CategoryProposals
                .AsNoTracking()
                .Where(p => p.CategoryId == categoryId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProposalDto {
                    Id = p.Id,
                    CategoryId = p.CategoryId,
                    Title = p.Title,
                    Description = p.Description,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<ProposalDto>> Create(long categoryId, [FromBody] ProposalCreateDto dto)
        {
            var exists = await _db.Categories.AnyAsync(c => c.Id == categoryId);
            if (!exists) return NotFound();

            var entity = new CategoryProposal
            {
                CategoryId = categoryId,
                Title = dto.Title,
                Description = dto.Description,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            _db.CategoryProposals.Add(entity);
            await _db.SaveChangesAsync();

            var result = new ProposalDto {
                Id = entity.Id,
                CategoryId = entity.CategoryId,
                Title = entity.Title,
                Description = entity.Description,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt
            };
            return CreatedAtAction(nameof(List), new { categoryId }, result);
        }
    }

    // Exemplos mínimos de entidades para referência; remove caso já existam no teu domínio.
    public class CategoryProposal
    {
        public long Id { get; set; }
        public long CategoryId { get; set; }
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Category
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
    }

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<CategoryProposal> CategoryProposals => Set<CategoryProposal>();
        public DbSet<Category> Categories => Set<Category>();
    }
}
