using Microsoft.AspNetCore.Mvc;
using XPlayer.Api.DTOs;
using XPlayer.BL.Interfaces;
using XPlayer.Domain.Services; // Ajusta o namespace consoante a tua estrutura

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;

    // Injeção de dependência mais limpa
    public AuthController(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest req)
    {
        // No futuro, aqui terás a validação na BD: if(!_userService.VerifyPassword(req.Email, req.Password)) return Unauthorized();

        var token = _tokenService.GenerateToken(req.Email);
        var displayName = req.Email.Split('@')[0];

        return Ok(new LoginResponse(token, displayName));
    }
}