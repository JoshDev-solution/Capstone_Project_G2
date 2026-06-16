namespace LJVetClinic.Domain.Entities;

using LJVetClinic.Domain.Common;

public class Refund : BaseEntity
{
    public string RefundCode { get; set; } = string.Empty;
    public long PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public long BillId { get; set; }
    public Bill? Bill { get; set; }

    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public long? ApprovedBy { get; set; }
    public long? ProcessedBy { get; set; }
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? Notes { get; set; }
}
