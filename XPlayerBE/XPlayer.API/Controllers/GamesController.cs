using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using XPlayer.Api.DTOs;
using XPlayer.Infrastructure.Media;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController : ControllerBase
{
    private readonly IGameImageService _images;
    public GamesController(IGameImageService images)=>_images=images;

    /// <summary>Devolve URL servida pelo backend para a capa do jogo. Tenta URL fornecida e RAWG; faz cache.</summary>
    [HttpGet("{externalId}/cover")]
    [AllowAnonymous]
    public async Task<ActionResult<GameImageResponse>> GetCover([FromRoute] string externalId, [FromQuery] string? imageUrl, CancellationToken ct)
    {
        var (url, cached) = await _images.GetOrFetchCoverAsync(externalId, imageUrl, ct);
        return Ok(new GameImageResponse(url, cached));
    }
}