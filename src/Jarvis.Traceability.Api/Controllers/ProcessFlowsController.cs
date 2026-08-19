using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Dtos;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Controllers
{
    [ApiController]
    [Route("api/v1/process-flows")]
    public class ProcessFlowsController : ControllerBase
    {
        private readonly SiteDbContext _siteDb;
        private readonly EdgeDbContext _edgeDb;

        public ProcessFlowsController(SiteDbContext siteDb, EdgeDbContext edgeDb)
        {
            _siteDb = siteDb;
            _edgeDb = edgeDb;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcessFlowResponseDto>>> GetProcessFlows()
        {
            var flows = await _siteDb.ProcessFlows
                .Include(f => f.Steps.OrderBy(s => s.StepOrder))
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            var dtos = flows.Select(f => new ProcessFlowResponseDto
            {
                Id = f.Id,
                ProductId = f.ProductId,
                FlowCode = f.FlowCode,
                Description = f.Description,
                SyncStatus = f.SyncStatus,
                CreatedAt = f.CreatedAt,
                Steps = f.Steps.Select(s => new ProcessStepDto
                {
                    Id = s.Id,
                    FlowId = s.FlowId,
                    StepCode = s.StepCode,
                    StepName = s.StepName,
                    StepOrder = s.StepOrder
                }).ToList()
            });

            return Ok(dtos);
        }

        [HttpGet("edge")]
        public async Task<ActionResult<IEnumerable<ProcessFlowResponseDto>>> GetEdgeProcessFlows()
        {
            var flows = await _edgeDb.ProcessFlows
                .Include(f => f.Steps.OrderBy(s => s.StepOrder))
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            var dtos = flows.Select(f => new ProcessFlowResponseDto
            {
                Id = f.Id,
                ProductId = f.ProductId,
                FlowCode = f.FlowCode,
                Description = f.Description,
                SyncStatus = f.SyncStatus,
                CreatedAt = f.CreatedAt,
                Steps = f.Steps.Select(s => new ProcessStepDto
                {
                    Id = s.Id,
                    FlowId = s.FlowId,
                    StepCode = s.StepCode,
                    StepName = s.StepName,
                    StepOrder = s.StepOrder
                }).ToList()
            });

            return Ok(dtos);
        }

        [HttpPost]
        public async Task<ActionResult<ProcessFlowResponseDto>> CreateProcessFlow([FromBody] CreateProcessFlowDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var flow = new ProcessFlow
            {
                ProductId = dto.ProductId,
                FlowCode = dto.FlowCode,
                Description = dto.Description,
                SyncStatus = "SYNCED"
            };

            _siteDb.ProcessFlows.Add(flow);
            await _siteDb.SaveChangesAsync();

            // Auto sync to Edge
            _edgeDb.ProcessFlows.Add(new ProcessFlow
            {
                ProductId = flow.ProductId,
                FlowCode = flow.FlowCode,
                Description = flow.Description,
                SyncStatus = "SYNCED"
            });
            await _edgeDb.SaveChangesAsync();

            return Ok(new ProcessFlowResponseDto
            {
                Id = flow.Id,
                ProductId = flow.ProductId,
                FlowCode = flow.FlowCode,
                Description = flow.Description,
                SyncStatus = flow.SyncStatus,
                CreatedAt = flow.CreatedAt,
                Steps = new()
            });
        }

        [HttpPost("{flowId}/steps")]
        public async Task<ActionResult<ProcessStepDto>> AddStepToFlow(Guid flowId, [FromBody] CreateProcessStepDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var siteFlow = await _siteDb.ProcessFlows.FindAsync(flowId);
            if (siteFlow != null)
            {
                var siteStep = new ProcessStep
                {
                    FlowId = flowId,
                    StepCode = dto.StepCode,
                    StepName = dto.StepName,
                    StepOrder = dto.StepOrder
                };

                _siteDb.ProcessSteps.Add(siteStep);
                await _siteDb.SaveChangesAsync();

                return Ok(new ProcessStepDto
                {
                    Id = siteStep.Id,
                    FlowId = siteStep.FlowId,
                    StepCode = siteStep.StepCode,
                    StepName = siteStep.StepName,
                    StepOrder = siteStep.StepOrder
                });
            }

            // Fallback to Edge DB if not in Site DB
            var edgeFlow = await _edgeDb.ProcessFlows.FindAsync(flowId) ?? await _edgeDb.ProcessFlows.FirstOrDefaultAsync();
            if (edgeFlow == null) return NotFound(new { message = $"Process flow {flowId} not found in Site or Edge DB." });

            var edgeStep = new ProcessStep
            {
                FlowId = edgeFlow.Id,
                StepCode = dto.StepCode,
                StepName = dto.StepName,
                StepOrder = dto.StepOrder
            };

            _edgeDb.ProcessSteps.Add(edgeStep);
            edgeFlow.SyncStatus = "EDGE_MODIFIED";
            await _edgeDb.SaveChangesAsync();

            return Ok(new ProcessStepDto
            {
                Id = edgeStep.Id,
                FlowId = edgeStep.FlowId,
                StepCode = edgeStep.StepCode,
                StepName = edgeStep.StepName,
                StepOrder = edgeStep.StepOrder
            });
        }

        [HttpPost("edge/{flowId}/steps")]
        public async Task<ActionResult<ProcessStepDto>> AddStepToEdgeFlow(Guid flowId, [FromBody] CreateProcessStepDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var edgeFlow = await _edgeDb.ProcessFlows.FindAsync(flowId) ?? await _edgeDb.ProcessFlows.FirstOrDefaultAsync();
            if (edgeFlow == null) return NotFound(new { message = $"Edge process flow {flowId} not found." });

            var edgeStep = new ProcessStep
            {
                FlowId = edgeFlow.Id,
                StepCode = dto.StepCode,
                StepName = dto.StepName,
                StepOrder = dto.StepOrder
            };

            _edgeDb.ProcessSteps.Add(edgeStep);
            edgeFlow.SyncStatus = "EDGE_MODIFIED";
            await _edgeDb.SaveChangesAsync();

            return Ok(new ProcessStepDto
            {
                Id = edgeStep.Id,
                FlowId = edgeStep.FlowId,
                StepCode = edgeStep.StepCode,
                StepName = edgeStep.StepName,
                StepOrder = edgeStep.StepOrder
            });
        }

        /// <summary>
        /// Edits process flow directly on Edge PC and synchronizes modifications back to Site DB (BUC-0 requirement)
        /// </summary>
        [HttpPut("edge-edit/{flowId}")]
        public async Task<ActionResult<ProcessFlowResponseDto>> EditOnEdgeAndSyncBack(Guid flowId, [FromBody] CreateProcessFlowDto dto)
        {
            var edgeFlow = await _edgeDb.ProcessFlows.FindAsync(flowId) ?? await _edgeDb.ProcessFlows.FirstOrDefaultAsync();
            if (edgeFlow == null) return NotFound(new { message = "Edge process flow not found." });

            edgeFlow.Description = $"{dto.Description} [EDGE_MODIFIED]";
            edgeFlow.SyncStatus = "EDGE_MODIFIED";
            await _edgeDb.SaveChangesAsync();

            // Bidirectional Sync: Push back modification to Site DB
            var siteFlow = await _siteDb.ProcessFlows.FirstOrDefaultAsync(f => f.ProductId == edgeFlow.ProductId && f.FlowCode == edgeFlow.FlowCode);
            if (siteFlow != null)
            {
                siteFlow.Description = edgeFlow.Description;
                siteFlow.SyncStatus = "EDGE_MODIFIED (Synced from Edge)";
                await _siteDb.SaveChangesAsync();
            }

            return Ok(new ProcessFlowResponseDto
            {
                Id = edgeFlow.Id,
                ProductId = edgeFlow.ProductId,
                FlowCode = edgeFlow.FlowCode,
                Description = edgeFlow.Description,
                SyncStatus = edgeFlow.SyncStatus,
                CreatedAt = edgeFlow.CreatedAt
            });
        }
    }
}
