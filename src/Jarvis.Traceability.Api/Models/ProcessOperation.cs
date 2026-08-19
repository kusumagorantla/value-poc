using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessOperation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StepId { get; set; }

        [Required]
        public int OperationCode { get; set; }

        [Required]
        [MaxLength(100)]
        public string OperationName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("StepId")]
        [JsonIgnore]
        public ProcessStep? Step { get; set; }

        public List<ProcessResultDefinition> ResultDefinitions { get; set; } = new();
    }
}
