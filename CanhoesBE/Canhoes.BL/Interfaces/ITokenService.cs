using System;
using System.Collections.Generic;
using System.Text;

namespace Canhoes.BL.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string email);
    }
}
