using System.ComponentModel.DataAnnotations;

namespace Jarvis.Traceability.Api.Dtos
{
    public class CreateProcessFlowDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        public string FlowCode { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }

    public class CreateProcessStepDto
    {
        [Required]
        public int StepCode { get; set; }

        [Required]
        public string StepName { get; set; } = string.Empty;

        public int StepOrder { get; set; }
    }

    public class ProcessFlowResponseDto
    {
        public Guid Id { get; set; }
        public string ProductId { get; set; } = string.Empty;
        public string FlowCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SyncStatus { get; set; } = "SYNCED";
        public DateTime CreatedAt { get; set; }
        public List<ProcessStepDto> Steps { get; set; } = new();
    }

    public class ProcessStepDto
    {
        public Guid Id { get; set; }
        public Guid FlowId { get; set; }
        public int StepCode { get; set; }
        public string StepName { get; set; } = string.Empty;
        public int StepOrder { get; set; }
    }
}
