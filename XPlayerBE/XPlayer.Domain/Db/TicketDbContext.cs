using FPTicketsAPI.Model;
using Microsoft.EntityFrameworkCore;

namespace FPTicketsAPI.Db
{
    public class TicketDbContext : DbContext
    {
        public TicketDbContext(DbContextOptions<TicketDbContext> options)
            : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<string>();
        }
    }
}
