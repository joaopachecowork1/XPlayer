using System.ComponentModel;
using System.Text.Json.Serialization;

namespace FPTicketsAPI.Model
{
    public class Ticket
    {
        public long Id { get; set; }
        public required string Description { get; set; }
        public required TicketStatus Status { get; set; }
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TicketStatus
    {
        Open,
        InProgress,
        Closed
    }
}
