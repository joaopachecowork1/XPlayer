using FPTicket.BL.Interfaces;
using FPTickets.Contracts.DTO;
using FPTicketsAPI.Db;
using FPTicketsAPI.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FPTicketsAPI.Services
{
    public class TicketService : ITicketService
    {
        private readonly TicketDbContext _db;

        public TicketService(TicketDbContext db)
        {
            _db = db;
        }

        public async Task<List<Ticket>> GetAllTicketsAsync()
        {
            return await _db.Tickets.ToListAsync();
        }

        public async Task<Ticket> GetTicketByIdAsync(long id)
        {
            return await _db.Tickets.FindAsync(id);
        }

        public async Task<Ticket> CreateTicketAsync(CreateTicketDTO dto)
        {
            var ticket = new Ticket
            {
                Description = dto.Description,
                Status = TicketStatus.Open
            };

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();

            return ticket;
        }

        public async Task<Ticket?> UpdateTicketAsync(long id, Ticket updatedTicket)
        {
            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return null;

            ticket.Description = updatedTicket.Description;
            ticket.Status = updatedTicket.Status;
            await _db.SaveChangesAsync();
            return ticket;
        }

        public async Task<bool> DeleteTicketAsync(long id)
        {
            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return false;

            _db.Tickets.Remove(ticket);
            await _db.SaveChangesAsync();
            return true;
        }
    }

}
