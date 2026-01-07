using FPTickets.Contracts.DTO;
using FPTicketsAPI.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace FPTicket.BL.Interfaces
{
    public interface ITicketService
    {
        Task<List<Ticket>> GetAllTicketsAsync();
        Task<Ticket> GetTicketByIdAsync(long id);
        Task<Ticket> CreateTicketAsync(CreateTicketDTO ticket);
        Task<Ticket> UpdateTicketAsync(long id, Ticket updatedTicket);
        Task<bool> DeleteTicketAsync(long id);
    }
}
