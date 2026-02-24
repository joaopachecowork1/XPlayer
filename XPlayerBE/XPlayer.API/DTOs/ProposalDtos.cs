
namespace App.DTOs
{
    public class ProposalCreateDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
    }

    public class ProposalDto
    {
        public required long Id { get; set; }
        public required long CategoryId { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public required string Status { get; set; } // pending|accepted|rejected
        public DateTime CreatedAt { get; set; }
    }
}
