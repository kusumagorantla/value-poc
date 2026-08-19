using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Models
{
    public class StationStepMapping
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string LineCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string StationCode { get; set; } = string.Empty;

        [Required]
        public Guid StepId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StepId")]
        [JsonIgnore]
        public ProcessStep? Step { get; set; }
    }
}
