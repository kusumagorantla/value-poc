using System.ComponentModel.DataAnnotations;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessFlow
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FlowCode { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string SyncStatus { get; set; } = "SYNCED";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<ProcessStep> Steps { get; set; } = new();
    }
}
