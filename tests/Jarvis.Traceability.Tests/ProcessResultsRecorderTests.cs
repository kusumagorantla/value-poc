using Xunit;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Models;
using Jarvis.Traceability.Api.Dtos;
using Jarvis.Traceability.Api.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Traceability.Tests
{
    public class ProcessResultsRecorderTests
    {
        private EdgeDbContext GetInMemoryEdgeDb(string dbName)
        {
            var options = new DbContextOptionsBuilder<EdgeDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new EdgeDbContext(options);
        }

        private SiteDbContext GetInMemorySiteDb(string dbName)
        {
            var options = new DbContextOptionsBuilder<SiteDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new SiteDbContext(options);
        }

        [Fact]
        public async Task IngestionAPI_Records_StandardPayload_Successfully()
        {
            // Arrange
            var db = GetInMemoryEdgeDb("TestDb_Standard");
            var controller = new TraceabilityIngestionController(db, null!);

            var payload = new ProcessResultsPayloadDto
            {
                StationId = "ST060.1",
                ProcessStepId = 11001,
                StationMode = 0,
                StepResult = 1,
                ProductSerialNo = "cee348d8-daa0-4730-8d5e-ac59311af94b",
                ProductId = "MATERIAL-1",
                DeviceTimestamp = DateTime.UtcNow,
                ProcessResults = new List<ProcessResultValueDto>
                {
                    new() { OperationCode = 123021, ResultCode = 50032, ValueNumeric = 92.4m },
                    new() { OperationCode = 123021, ResultCode = 50033, ValueNumeric = 5.12m }
                }
            };

            var jsonElement = JsonSerializer.SerializeToElement(payload);

            // Act
            var actionResult = await controller.IngestProcessResults(jsonElement);
            var result = actionResult.Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            
            var recorded = await db.ProcessResultRecords.FirstOrDefaultAsync(r => r.SerialNumber == "cee348d8-daa0-4730-8d5e-ac59311af94b");
            Assert.NotNull(recorded);
            Assert.Equal("STANDARD", recorded.StorageMode);
        }

        [Fact]
        public async Task IngestionAPI_Persists_DegradedMode_When_Station_Missing()
        {
            // Arrange
            var db = GetInMemoryEdgeDb("TestDb_Degraded");
            var controller = new TraceabilityIngestionController(db, null!);

            var payload = new ProcessResultsPayloadDto
            {
                StationId = "", // Missing station ID
                ProcessStepId = 11001,
                ProductSerialNo = "cee348d8-degraded-test",
                ProductId = "MATERIAL-1",
                DeviceTimestamp = DateTime.UtcNow
            };

            var jsonElement = JsonSerializer.SerializeToElement(payload);

            // Act
            var actionResult = await controller.IngestProcessResults(jsonElement);
            var result = actionResult.Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);

            var recorded = await db.ProcessResultRecords.FirstOrDefaultAsync(r => r.SerialNumber == "cee348d8-degraded-test");
            Assert.NotNull(recorded);
            Assert.Equal("DEGRADED_MISSING_CONTEXT", recorded.StorageMode);
        }

        [Fact]
        public async Task SiteToEdgeSync_Sets_Synced_Status()
        {
            // Arrange
            var siteDb = GetInMemorySiteDb("TestDb_SiteSync");
            var edgeDb = GetInMemoryEdgeDb("TestDb_EdgeSync");

            var flow = new ProcessFlow
            {
                ProductId = "MATERIAL-1",
                FlowCode = "FLOW1",
                Description = "Site Flow",
                SyncStatus = "PENDING"
            };
            siteDb.ProcessFlows.Add(flow);
            await siteDb.SaveChangesAsync();

            // Act - Deploy to Edge
            flow.SyncStatus = "SYNCED";
            await siteDb.SaveChangesAsync();

            edgeDb.ProcessFlows.Add(new ProcessFlow
            {
                ProductId = flow.ProductId,
                FlowCode = flow.FlowCode,
                Description = flow.Description,
                SyncStatus = "SYNCED"
            });
            await edgeDb.SaveChangesAsync();

            // Assert
            var siteRecord = await siteDb.ProcessFlows.FirstAsync();
            var edgeRecord = await edgeDb.ProcessFlows.FirstAsync();

            Assert.Equal("SYNCED", siteRecord.SyncStatus);
            Assert.Equal("SYNCED", edgeRecord.SyncStatus);
        }
    }
}
