using System.ComponentModel.DataAnnotations;

namespace Jarvis.Traceability.Api.Dtos
{
    public class CreateStationMappingDto
    {
        [Required]
        public string LineCode { get; set; } = string.Empty;

        [Required]
        public string StationCode { get; set; } = string.Empty;
    }

    public class StationMappingResponseDto
    {
        public Guid Id { get; set; }
        public string LineCode { get; set; } = string.Empty;
        public string StationCode { get; set; } = string.Empty;
        public Guid StepId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DeploymentResponseDto
    {
        public Guid FlowId { get; set; }
        public string ProductId { get; set; } = string.Empty;
        public string FlowCode { get; set; } = string.Empty;
        public string SyncStatus { get; set; } = "SYNCED";
        public DateTime DeployedAt { get; set; } = DateTime.UtcNow;
        public int StationsCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
