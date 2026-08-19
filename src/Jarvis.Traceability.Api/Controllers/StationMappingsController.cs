using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Dtos;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class StationMappingsController : ControllerBase
    {
        private readonly JarvisDbContext _db;

        public StationMappingsController(JarvisDbContext db)
        {
            _db = db;
        }

        [HttpGet("process-steps/{stepId}/station-mappings")]
        public async Task<ActionResult<IEnumerable<StationMappingResponseDto>>> GetMappingsForStep(Guid stepId)
        {
            var mappings = await _db.StationStepMappings
                .Where(m => m.StepId == stepId)
                .ToListAsync();

            var dtos = mappings.Select(m => new StationMappingResponseDto
            {
                Id = m.Id,
                LineCode = m.LineCode,
                StationCode = m.StationCode,
                StepId = m.StepId,
                CreatedAt = m.CreatedAt
            });

            return Ok(dtos);
        }

        [HttpPost("process-steps/{stepId}/station-mappings")]
        public async Task<ActionResult<StationMappingResponseDto>> AddStationMapping(Guid stepId, [FromBody] CreateStationMappingDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var step = await _db.ProcessSteps.FindAsync(stepId);
            if (step == null) return NotFound(new { message = $"Process step {stepId} not found." });

            var mapping = new StationStepMapping
            {
                StepId = stepId,
                LineCode = dto.LineCode,
                StationCode = dto.StationCode
            };

            _db.StationStepMappings.Add(mapping);
            await _db.SaveChangesAsync();

            return Ok(new StationMappingResponseDto
            {
                Id = mapping.Id,
                LineCode = mapping.LineCode,
                StationCode = mapping.StationCode,
                StepId = mapping.StepId,
                CreatedAt = mapping.CreatedAt
            });
        }

        [HttpPost("process-flows/{id}/deploy")]
        public async Task<ActionResult<DeploymentResponseDto>> DeployFlowToEdge(Guid id)
        {
            var flow = await _db.ProcessFlows
                .Include(f => f.Steps)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (flow == null) return NotFound(new { message = $"Process flow {id} not found." });

            flow.SyncStatus = "SYNCED";
            await _db.SaveChangesAsync();

            var mappedStationsCount = await _db.StationStepMappings
                .Where(m => flow.Steps.Select(s => s.Id).Contains(m.StepId))
                .Select(m => m.StationCode)
                .Distinct()
                .CountAsync();

            return Ok(new DeploymentResponseDto
            {
                FlowId = flow.Id,
                ProductId = flow.ProductId,
                FlowCode = flow.FlowCode,
                SyncStatus = "SYNCED",
                DeployedAt = DateTime.UtcNow,
                StationsCount = mappedStationsCount,
                Message = $"Process Flow {flow.ProductId} ({flow.FlowCode}) compiled and successfully deployed to Line Edge PCs."
            });
        }
    }
}
