using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jarvis.Traceability.Api.Models
{
    public class RecordingAuditLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public string ClientIp { get; set; } = "127.0.0.1";

        [Required]
        [MaxLength(50)]
        public string StorageMode { get; set; } = "STANDARD"; // STANDARD | DEGRADED_MISSING_CONTEXT

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "SUCCESS";

        public double LatencyMs { get; set; }

        [Column(TypeName = "jsonb")]
        public string RawPayload { get; set; } = "{}";

        public string ErrorMessage { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
