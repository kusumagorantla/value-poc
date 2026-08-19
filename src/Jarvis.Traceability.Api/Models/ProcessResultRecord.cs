using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Jarvis.Traceability.Api.Models
{
    public class ProcessResultRecord
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string SerialNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string StationCode { get; set; } = string.Empty;

        public int StepCode { get; set; }

        public int StationMode { get; set; } // 0=Serial, 1=Prototype, 3=Retest, 4=Rework, 5=MasterSample, X=StepByStep

        public int StepResult { get; set; } = 1; // 1=PASS(OK), 2=FAILED(NOK), 3=SCRAP

        public string FailureCode { get; set; } = string.Empty;

        public string WpcNo { get; set; } = string.Empty;

        public decimal? MachineTime { get; set; }

        public decimal? CycleTime { get; set; }

        public DateTime DeviceTimestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string StorageMode { get; set; } = "STANDARD"; // STANDARD | DEGRADED_MISSING_CONTEXT | EDGE_BUFFERED

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<ProcessResultValue> Values { get; set; } = new();
    }
}
