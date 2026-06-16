namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Payment : BaseEntity
{
    public string PaymentCode { get; set; } = string.Empty;
    public long BillId { get; set; }
    public Bill? Bill { get; set; }

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Cash, GCash, Maya, CreditCard, BankTransfer
    public string Status { get; set; } = "Pending";
    public string? ReferenceNumber { get; set; }
    public long? ReceivedBy { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<Refund> Refunds { get; set; } = new List<Refund>();
}
