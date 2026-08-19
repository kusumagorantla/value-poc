using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessResultValue
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RecordId { get; set; }

        public int OperationCode { get; set; }

        public int ResultCode { get; set; }

        public decimal? ValueNumeric { get; set; }

        public string ValueText { get; set; } = string.Empty;

        public string ValueFileRef { get; set; } = string.Empty;

        [ForeignKey("RecordId")]
        [JsonIgnore]
        public ProcessResultRecord? Record { get; set; }
    }
}
