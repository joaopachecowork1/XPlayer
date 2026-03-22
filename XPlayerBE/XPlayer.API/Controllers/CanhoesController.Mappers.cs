using XPlayer.Api.Models;

namespace XPlayer.Api.Controllers;

public partial class CanhoesController
{
    private static AwardCategoryDto ToAwardCategoryDto(AwardCategoryEntity c) =>
        new(c.Id, c.Name, c.SortOrder, c.IsActive, c.Kind.ToString(), c.Description, c.VoteQuestion, c.VoteRules);

    private static CategoryProposalDto ToCategoryProposalDto(CategoryProposalEntity p) =>
        new(p.Id, p.Name, p.Description, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));

    private static MeasureProposalDto ToMeasureProposalDto(MeasureProposalEntity p) =>
        new(p.Id, p.Text, p.Status, new DateTimeOffset(p.CreatedAtUtc, TimeSpan.Zero));
}
