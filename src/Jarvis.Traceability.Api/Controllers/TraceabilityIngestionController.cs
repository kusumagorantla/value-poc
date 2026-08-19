using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Dtos;
using Jarvis.Traceability.Api.Models;
using Jarvis.Traceability.Api.Services;

namespace Jarvis.Traceability.Api.Controllers
{
    [ApiController]
    [Route("api/v1/traceability")]
    public class TraceabilityIngestionController : ControllerBase
    {
        private readonly EdgeDbContext _edgeDb;
        private readonly IAuditLogChannelWriter? _auditQueue;

        public TraceabilityIngestionController(EdgeDbContext edgeDb, IAuditLogChannelWriter? auditQueue = null)
        {
            _edgeDb = edgeDb;
            _auditQueue = auditQueue;
        }

        [HttpPost("process-results")]
        public async Task<ActionResult<IngestionResponseDto>> IngestProcessResults([FromBody] JsonElement rawElement)
        {
            var stopwatch = Stopwatch.StartNew();

            string storageMode = "STANDARD";
            string serialNo = string.Empty;
            string stationId = string.Empty;
            int stepCode = 0;
            int stationMode = 0;
            int stepResult = 1;
            string failureCode = string.Empty;
            string wpcNo = string.Empty;
            decimal? machineTime = null;
            decimal? cycleTime = null;
            DateTime deviceTimestamp = DateTime.UtcNow;

            var valuesList = new List<ProcessResultValue>();

            try
            {
                // Format 1: Nested VIB Benchmark Format (product_context, process_context, process_results)
                if (rawElement.TryGetProperty("product_context", out var prodCtx) || rawElement.TryGetProperty("process_context", out _))
                {
                    if (prodCtx.ValueKind != JsonValueKind.Undefined)
                    {
                        if (prodCtx.TryGetProperty("product_serial_no", out var sn)) serialNo = sn.GetString() ?? string.Empty;
                    }

                    if (rawElement.TryGetProperty("process_context", out var procCtx))
                    {
                        if (procCtx.TryGetProperty("station_id", out var st)) stationId = st.GetString() ?? string.Empty;
                        if (procCtx.TryGetProperty("process_step_id", out var step)) stepCode = step.GetInt32();
                        if (procCtx.TryGetProperty("station_mode", out var smode)) stationMode = smode.GetInt32();
                        if (procCtx.TryGetProperty("process_step_result", out var sres)) stepResult = sres.GetInt32();
                        if (procCtx.TryGetProperty("wpc_no", out var wpc)) wpcNo = wpc.GetString() ?? string.Empty;
                        if (procCtx.TryGetProperty("machine_time", out var mtime)) machineTime = mtime.GetDecimal();
                        if (procCtx.TryGetProperty("cycle_time", out var ctime)) cycleTime = ctime.GetDecimal();
                    }

                    if (rawElement.TryGetProperty("time_context", out var timeCtx) && timeCtx.TryGetProperty("timestamp", out var ts))
                    {
                        if (DateTime.TryParse(ts.GetString(), out var dt)) deviceTimestamp = dt;
                    }

                    if (rawElement.TryGetProperty("process_results", out var resultsArray) && resultsArray.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in resultsArray.EnumerateArray())
                        {
                            int opCode = item.TryGetProperty("process_operation_id", out var op) ? op.GetInt32() : 0;
                            int resCode = item.TryGetProperty("process_result_id", out var rc) ? rc.GetInt32() : 0;
                            decimal? valNum = item.TryGetProperty("value_numeric", out var vn) ? vn.GetDecimal() : null;
                            string valTxt = item.TryGetProperty("value_text", out var vt) ? vt.GetString() ?? string.Empty : string.Empty;

                            valuesList.Add(new ProcessResultValue
                            {
                                OperationCode = opCode,
                                ResultCode = resCode,
                                ValueNumeric = valNum,
                                ValueText = valTxt
                            });
                        }
                    }
                }
                else
                {
                    // Format 2: Flat Format (ProductSerialNo, StationId, ProcessStepId)
                    var flatRequest = JsonSerializer.Deserialize<ProcessResultsPayloadDto>(rawElement.GetRawText());
                    if (flatRequest != null)
                    {
                        serialNo = flatRequest.ProductSerialNo ?? string.Empty;
                        stationId = flatRequest.StationId ?? string.Empty;
                        stepCode = flatRequest.ProcessStepId;
                        stationMode = flatRequest.StationMode;
                        stepResult = flatRequest.StepResult;
                        failureCode = flatRequest.FailureCode ?? string.Empty;
                        wpcNo = flatRequest.WpcNo ?? string.Empty;
                        machineTime = flatRequest.MachineTime;
                        cycleTime = flatRequest.CycleTime;
                        deviceTimestamp = flatRequest.DeviceTimestamp == default ? DateTime.UtcNow : flatRequest.DeviceTimestamp;

                        if (flatRequest.ProcessResults != null)
                        {
                            foreach (var item in flatRequest.ProcessResults)
                            {
                                valuesList.Add(new ProcessResultValue
                                {
                                    OperationCode = item.OperationCode,
                                    ResultCode = item.ResultCode,
                                    ValueNumeric = item.ValueNumeric,
                                    ValueText = item.ValueText,
                                    ValueFileRef = item.ValueFileRef
                                });
                            }
                        }
                    }
                }
            }
            catch
            {
                storageMode = "DEGRADED_INVALID_PAYLOAD";
            }

            // Degraded Mode Evaluation Check (Zero Data Loss Guarantee)
            if (string.IsNullOrWhiteSpace(stationId) || string.IsNullOrWhiteSpace(serialNo) || stepCode == 0)
            {
                storageMode = "DEGRADED_MISSING_CONTEXT";
                if (string.IsNullOrWhiteSpace(stationId)) stationId = "UNKNOWN_STATION";
                if (string.IsNullOrWhiteSpace(serialNo)) serialNo = "UNKNOWN_SERIAL";
            }

            var record = new ProcessResultRecord
            {
                SerialNumber = serialNo,
                StationCode = stationId,
                StepCode = stepCode,
                StationMode = stationMode,
                StepResult = stepResult,
                FailureCode = failureCode,
                WpcNo = wpcNo,
                MachineTime = machineTime,
                CycleTime = cycleTime,
                DeviceTimestamp = deviceTimestamp,
                StorageMode = storageMode,
                Values = valuesList
            };

            _edgeDb.ProcessResultRecords.Add(record);
            await _edgeDb.SaveChangesAsync();

            stopwatch.Stop();
            double latency = Math.Round(stopwatch.Elapsed.TotalMilliseconds, 2);

            // Dispatch Non-Blocking Audit Log Snapshot to Background Channel (protects <50ms SLA)
            _auditQueue?.QueueAuditLog(new RecordingAuditLog
            {
                ClientIp = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                StorageMode = storageMode,
                Status = "SUCCESS",
                LatencyMs = latency,
                RawPayload = rawElement.GetRawText(),
                CreatedAt = DateTime.UtcNow
            });

            return Ok(new IngestionResponseDto
            {
                Status = "SUCCESS",
                StorageMode = storageMode,
                TransactionId = $"tx_{record.Id.ToString()[..8]}",
                ProcessedAt = DateTime.UtcNow,
                LatencyMs = latency,
                RecordsInserted = record.Values.Count,
                Errors = new()
            });
        }

        [HttpGet("process-results")]
        public async Task<ActionResult<IEnumerable<ProcessResultRecord>>> GetRecordedResults([FromQuery] int limit = 20)
        {
            var records = await _edgeDb.ProcessResultRecords
                .Include(r => r.Values)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(records);
        }

        [HttpGet("audit-logs")]
        public async Task<ActionResult<IEnumerable<RecordingAuditLog>>> GetAuditLogs([FromQuery] int limit = 20)
        {
            var logs = await _edgeDb.RecordingAuditLogs
                .OrderByDescending(l => l.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(logs);
        }
    }
}
