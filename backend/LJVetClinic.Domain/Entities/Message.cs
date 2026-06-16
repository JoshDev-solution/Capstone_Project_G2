namespace LJVetClinic.Domain.Entities;

public class Message
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public User? Sender { get; set; }

    public long ReceiverId { get; set; }
    public User? Receiver { get; set; }

    public string? Subject { get; set; }
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public long? ParentId { get; set; }
    public Message? Parent { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Message> Replies { get; set; } = new List<Message>();
}
