using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Dtos;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Controllers
{
    [ApiController]
    [Route("api/v1")]
    public class ProcessOperationsController : ControllerBase
    {
        private readonly JarvisDbContext _db;

        public ProcessOperationsController(JarvisDbContext db)
        {
            _db = db;
        }

        [HttpGet("process-steps/{stepId}/operations")]
        public async Task<ActionResult<IEnumerable<ProcessOperationResponseDto>>> GetOperationsForStep(Guid stepId)
        {
            var ops = await _db.ProcessOperations
                .Include(o => o.ResultDefinitions)
                .Where(o => o.StepId == stepId)
                .OrderBy(o => o.OperationCode)
                .ToListAsync();

            var dtos = ops.Select(o => new ProcessOperationResponseDto
            {
                Id = o.Id,
                StepId = o.StepId,
                OperationCode = o.OperationCode,
                OperationName = o.OperationName,
                ResultDefinitions = o.ResultDefinitions.Select(r => new ProcessResultDefinitionResponseDto
                {
                    Id = r.Id,
                    OperationId = r.OperationId,
                    ResultCode = r.ResultCode,
                    ResultName = r.ResultName,
                    ResultType = r.ResultType,
                    Uom = r.Uom,
                    Nominal = r.Nominal,
                    Lsl = r.Lsl,
                    Usl = r.Usl,
                    IsMandatory = r.IsMandatory
                }).ToList()
            });

            return Ok(dtos);
        }

        [HttpPost("process-steps/{stepId}/operations")]
        public async Task<ActionResult<ProcessOperationResponseDto>> AddOperationToStep(Guid stepId, [FromBody] CreateProcessOperationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var step = await _db.ProcessSteps.FindAsync(stepId);
            if (step == null) return NotFound(new { message = $"Process step {stepId} not found." });

            var op = new ProcessOperation
            {
                StepId = stepId,
                OperationCode = dto.OperationCode,
                OperationName = dto.OperationName
            };

            _db.ProcessOperations.Add(op);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOperationsForStep), new { stepId = stepId }, new ProcessOperationResponseDto
            {
                Id = op.Id,
                StepId = op.StepId,
                OperationCode = op.OperationCode,
                OperationName = op.OperationName,
                ResultDefinitions = new()
            });
        }

        [HttpPost("process-operations/{operationId}/result-definitions")]
        public async Task<ActionResult<ProcessResultDefinitionResponseDto>> AddResultDefinition(Guid operationId, [FromBody] CreateProcessResultDefinitionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var op = await _db.ProcessOperations.FindAsync(operationId);
            if (op == null) return NotFound(new { message = $"Process operation {operationId} not found." });

            var resultDef = new ProcessResultDefinition
            {
                OperationId = operationId,
                ResultCode = dto.ResultCode,
                ResultName = dto.ResultName,
                ResultType = dto.ResultType,
                Uom = dto.Uom,
                Nominal = dto.Nominal,
                Lsl = dto.Lsl,
                Usl = dto.Usl,
                IsMandatory = dto.IsMandatory
            };

            _db.ProcessResultDefinitions.Add(resultDef);
            await _db.SaveChangesAsync();

            return Ok(new ProcessResultDefinitionResponseDto
            {
                Id = resultDef.Id,
                OperationId = resultDef.OperationId,
                ResultCode = resultDef.ResultCode,
                ResultName = resultDef.ResultName,
                ResultType = resultDef.ResultType,
                Uom = resultDef.Uom,
                Nominal = resultDef.Nominal,
                Lsl = resultDef.Lsl,
                Usl = resultDef.Usl,
                IsMandatory = resultDef.IsMandatory
            });
        }
    }
}
