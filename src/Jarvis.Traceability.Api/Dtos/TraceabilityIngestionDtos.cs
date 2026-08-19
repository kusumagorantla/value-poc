using System.Text.Json.Serialization;

namespace Jarvis.Traceability.Api.Dtos
{
    public class ProductContextDto
    {
        [JsonPropertyName("product_id")]
        public string ProductId { get; set; } = string.Empty;

        [JsonPropertyName("product_serial_no")]
        public string ProductSerialNo { get; set; } = string.Empty;
    }

    public class TimeContextDto
    {
        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ProcessContextDto
    {
        [JsonPropertyName("station_id")]
        public string StationId { get; set; } = string.Empty;

        [JsonPropertyName("process_step_id")]
        public int ProcessStepId { get; set; }

        [JsonPropertyName("station_mode")]
        public int StationMode { get; set; }

        [JsonPropertyName("process_step_result")]
        public int ProcessStepResult { get; set; } = 1;

        [JsonPropertyName("failure_code")]
        public string FailureCode { get; set; } = string.Empty;

        [JsonPropertyName("wpc_no")]
        public string WpcNo { get; set; } = string.Empty;

        [JsonPropertyName("machine_time")]
        public decimal? MachineTime { get; set; }

        [JsonPropertyName("cycle_time")]
        public decimal? CycleTime { get; set; }
    }

    public class ProcessResultItemDto
    {
        [JsonPropertyName("process_operation_id")]
        public int ProcessOperationId { get; set; }

        [JsonPropertyName("process_operation_result")]
        public int ProcessOperationResult { get; set; } = 1;

        [JsonPropertyName("process_result_id")]
        public int ProcessResultId { get; set; }

        [JsonPropertyName("value_numeric")]
        public decimal? ValueNumeric { get; set; }

        [JsonPropertyName("value_text")]
        public string ValueText { get; set; } = string.Empty;

        [JsonPropertyName("value_file_ref")]
        public string ValueFileRef { get; set; } = string.Empty;
    }

    public class IngestionRequestDto
    {
        [JsonPropertyName("product_context")]
        public ProductContextDto ProductContext { get; set; } = new();

        [JsonPropertyName("time_context")]
        public TimeContextDto TimeContext { get; set; } = new();

        [JsonPropertyName("process_context")]
        public ProcessContextDto ProcessContext { get; set; } = new();

        [JsonPropertyName("process_results")]
        public List<ProcessResultItemDto> ProcessResults { get; set; } = new();
    }

    public class ProcessResultValueDto
    {
        public int OperationCode { get; set; }
        public int ResultCode { get; set; }
        public decimal? ValueNumeric { get; set; }
        public string ValueText { get; set; } = string.Empty;
        public string ValueFileRef { get; set; } = string.Empty;
    }

    public class ProcessResultsPayloadDto
    {
        public string StationId { get; set; } = string.Empty;
        public int ProcessStepId { get; set; }
        public int StationMode { get; set; }
        public int StepResult { get; set; } = 1;
        public string FailureCode { get; set; } = string.Empty;
        public string WpcNo { get; set; } = string.Empty;
        public decimal? MachineTime { get; set; }
        public decimal? CycleTime { get; set; }
        public string ProductSerialNo { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public DateTime DeviceTimestamp { get; set; } = DateTime.UtcNow;
        public List<ProcessResultValueDto> ProcessResults { get; set; } = new();
    }

    public class IngestionResponseDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "SUCCESS";

        [JsonPropertyName("storage_mode")]
        public string StorageMode { get; set; } = "STANDARD";

        [JsonPropertyName("transaction_id")]
        public string TransactionId { get; set; } = string.Empty;

        [JsonPropertyName("processed_at")]
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("latency_ms")]
        public double LatencyMs { get; set; }

        [JsonPropertyName("records_inserted")]
        public int RecordsInserted { get; set; }

        [JsonPropertyName("errors")]
        public List<string> Errors { get; set; } = new();
    }
}
