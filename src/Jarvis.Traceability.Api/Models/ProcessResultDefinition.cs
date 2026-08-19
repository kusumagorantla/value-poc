using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessResultDefinition
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid OperationId { get; set; }

        [Required]
        public int ResultCode { get; set; }

        [Required]
        [MaxLength(100)]
        public string ResultName { get; set; } = string.Empty;

        public int ResultType { get; set; } = 1; // 1 = Numeric, 2 = Text, 3 = File Ref

        [MaxLength(20)]
        public string Uom { get; set; } = string.Empty;

        public decimal? Nominal { get; set; }

        public decimal? Lsl { get; set; }

        public decimal? Usl { get; set; }

        public bool IsMandatory { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OperationId")]
        [JsonIgnore]
        public ProcessOperation? Operation { get; set; }
    }
}
