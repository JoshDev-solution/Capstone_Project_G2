namespace LJVetClinic.Domain.Entities;

public class ChatbotLog
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public User? User { get; set; }

    public string SessionId { get; set; } = string.Empty;
    public string UserMessage { get; set; } = string.Empty;
    public string BotResponse { get; set; } = string.Empty;
    public string? Intent { get; set; }
    public decimal? Confidence { get; set; }
    public bool Escalated { get; set; } = false;
    public long? EscalatedTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
