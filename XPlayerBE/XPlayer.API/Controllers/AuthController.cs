using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using XPlayer.Api.DTOs;

namespace XPlayer.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    public AuthController(IConfiguration config)=>_config=config;

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest req)
    {
        var claims=new[]{ new Claim(JwtRegisteredClaimNames.Sub,req.Email), new Claim(JwtRegisteredClaimNames.Email,req.Email), new Claim("displayName", req.Email.Split('@')[0]) };
        var key=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds=new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires=DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresMinutes"]??"120"));
        var token=new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, expires:expires, signingCredentials:creds);
        return Ok(new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token), req.Email.Split('@')[0]));
    }
}