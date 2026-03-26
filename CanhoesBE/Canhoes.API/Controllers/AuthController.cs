using Microsoft.AspNetCore.Mvc;
using Canhoes.Api.DTOs;
using Canhoes.BL.Interfaces;

namespace Canhoes.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;

    // Inje��o de depend�ncia mais limpa
    public AuthController(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest req)
    {
        // No futuro, aqui ter�s a valida��o na BD: if(!_userService.VerifyPassword(req.Email, req.Password)) return Unauthorized();

        var token = _tokenService.GenerateToken(req.Email);
        var displayName = req.Email.Split('@')[0];

        return Ok(new LoginResponse(token, displayName));
    }
}