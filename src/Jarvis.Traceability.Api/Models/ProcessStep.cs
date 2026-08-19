using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessStep
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid FlowId { get; set; }

        [Required]
        public int StepCode { get; set; }

        [Required]
        [MaxLength(100)]
        public string StepName { get; set; } = string.Empty;

        public int StepOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("FlowId")]
        [JsonIgnore]
        public ProcessFlow? Flow { get; set; }

        public List<ProcessOperation> Operations { get; set; } = new();
    }
}
