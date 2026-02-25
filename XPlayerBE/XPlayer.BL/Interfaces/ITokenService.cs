using System;
using System.Collections.Generic;
using System.Text;

namespace XPlayer.BL.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string email);
    }
}
