using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Jarvis.Traceability.Api.Controllers;

[ApiController]
[Route("api/v1/ai-sdlc")]
public class AiSdlcOrchestratorController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    
    // In-memory persistent stage gate state machine
    private static readonly Dictionary<int, string> GateStatuses = new()
    {
        { 1, "IN_REVIEW" }, // Phase 1 active for human approval
        { 2, "PENDING" },   // Locked until Phase 1 approved
        { 3, "PENDING" },   // Locked until Phase 2 approved
        { 4, "PENDING" },   // Locked until Phase 3 approved
        { 5, "PENDING" },   // Locked until Phase 4 approved
        { 6, "PENDING" }    // Locked until Phase 5 approved
    };

    public AiSdlcOrchestratorController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet("phases")]
    public IActionResult GetPhases()
    {
        var phases = new[]
        {
            new
            {
                phaseNumber = 1,
                title = "Phase 01: Requirements Refinement",
                agentRole = "Product Manager / Analyst Agent",
                agentPersona = "Mary & John",
                model = "Gemini 1.5 Pro",
                gateStatus = GateStatuses[1],
                promptTokens = 42850,
                outputTokens = 8420,
                totalTokens = 51270,
                cachingHitRate = "78.4%",
                latencySec = 18.2,
                costEstimate = "$0.061 USD",
                agentReportTitle = "01_requirements_analyst_report.md",
                generatedArtifactTitle = "requirements.md"
            },
            new
            {
                phaseNumber = 2,
                title = "Phase 02: Technical Architecture & UX Design",
                agentRole = "Architect & UX Designer Agents",
                agentPersona = "Winston & Sally",
                model = "Gemini 1.5 Pro",
                gateStatus = GateStatuses[2],
                promptTokens = 97520,
                outputTokens = 19240,
                totalTokens = 116760,
                cachingHitRate = "80.1%",
                latencySec = 41.4,
                costEstimate = "$0.139 USD",
                agentReportTitle = "02_architecture_architect_report.md",
                generatedArtifactTitle = "architecture.md"
            },
            new
            {
                phaseNumber = 3,
                title = "Phase 03: Code Implementation",
                agentRole = "Senior Developer Agent",
                agentPersona = "Amelia",
                model = "Gemini 1.5 Pro",
                gateStatus = GateStatuses[3],
                promptTokens = 86400,
                outputTokens = 18200,
                totalTokens = 104600,
                cachingHitRate = "85.3%",
                latencySec = 38.4,
                costEstimate = "$0.128 USD",
                agentReportTitle = "04_senior_developer_report.md",
                generatedArtifactTitle = "epics.md"
            },
            new
            {
                phaseNumber = 4,
                title = "Phase 04: QA Review, Testing & SLA Benchmarking",
                agentRole = "QA & Reviewer Agent",
                agentPersona = "QA Lead",
                model = "Gemini 1.5 Flash / Pro",
                gateStatus = GateStatuses[4],
                promptTokens = 31200,
                outputTokens = 5600,
                totalTokens = 36800,
                cachingHitRate = "81.0%",
                latencySec = 12.1,
                costEstimate = "$0.042 USD",
                agentReportTitle = "05_qa_reviewer_report.md",
                generatedArtifactTitle = "qa_sla_benchmark_results.md"
            },
            new
            {
                phaseNumber = 5,
                title = "Phase 05: Context Refresh & Token Analytics",
                agentRole = "Orchestrator Agent",
                agentPersona = "JARVIS Orchestrator",
                model = "Gemini 1.5 Pro",
                gateStatus = GateStatuses[5],
                promptTokens = 257970,
                outputTokens = 51460,
                totalTokens = 309430,
                cachingHitRate = "81.2%",
                latencySec = 103.5,
                costEstimate = "$0.370 USD",
                agentReportTitle = "token_utilization_and_agent_metrics.md",
                generatedArtifactTitle = "context_cache_and_project_spine.md"
            },
            new
            {
                phaseNumber = 6,
                title = "Phase 06: Release & Containerization",
                agentRole = "Orchestrator & DevOps Agent",
                agentPersona = "JARVIS DevOps Lead",
                model = "Gemini 1.5 Pro",
                gateStatus = GateStatuses[6],
                promptTokens = 12400,
                outputTokens = 2800,
                totalTokens = 15200,
                cachingHitRate = "84.0%",
                latencySec = 6.8,
                costEstimate = "$0.018 USD",
                agentReportTitle = "AI_ENGINEERING_LOG.md",
                generatedArtifactTitle = "release_manifest_and_infra.md"
            }
        };

        return Ok(phases);
    }

    [HttpGet("artifacts/{filename}")]
    public IActionResult GetArtifactContent(string filename)
    {
        var sanitizedFilename = Path.GetFileName(filename);
        var baseDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "..", "_bmad-output"));

        string filePath = Path.Combine(baseDir, "planning-artifacts", sanitizedFilename);
        if (!System.IO.File.Exists(filePath))
        {
            filePath = Path.Combine(baseDir, sanitizedFilename);
        }

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = $"Artifact file '{sanitizedFilename}' not found on disk." });
        }

        var content = System.IO.File.ReadAllText(filePath);
        var fileInfo = new FileInfo(filePath);

        return Ok(new
        {
            filename = sanitizedFilename,
            path = filePath,
            content,
            lastModified = fileInfo.LastWriteTimeUtc
        });
    }

    [HttpPost("gates/{phaseNumber}/approve")]
    public IActionResult ApproveGate(int phaseNumber)
    {
        if (phaseNumber < 1 || phaseNumber > 6)
        {
            return BadRequest(new { message = "Invalid phase number. Must be between 1 and 6." });
        }

        // Approve current phase
        GateStatuses[phaseNumber] = "APPROVED";

        // Unlock next phase if available
        if (phaseNumber + 1 <= 6 && GateStatuses[phaseNumber + 1] == "PENDING")
        {
            GateStatuses[phaseNumber + 1] = "IN_REVIEW";
        }

        // Append approval entry to AI_ENGINEERING_LOG.md
        var baseDir = Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "..", "_bmad-output"));
        var logPath = Path.Combine(baseDir, "AI_ENGINEERING_LOG.md");

        if (System.IO.File.Exists(logPath))
        {
            var approvalNote = $"\n* [{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] **Human Stage Gate {phaseNumber} Approved** via Web UI Orchestration Console ✅";
            System.IO.File.AppendAllText(logPath, approvalNote);
        }

        return Ok(new
        {
            phaseNumber,
            gateStatus = "APPROVED",
            nextUnlockedPhase = phaseNumber + 1 <= 6 ? phaseNumber + 1 : (int?)null,
            message = $"Human stage gate for Phase {phaseNumber} approved and logged to AI_ENGINEERING_LOG.md."
        });
    }

    [HttpPost("reset-gates")]
    public IActionResult ResetGates()
    {
        GateStatuses[1] = "IN_REVIEW";
        for (int i = 2; i <= 6; i++)
        {
            GateStatuses[i] = "PENDING";
        }

        return Ok(new { message = "All stage gates reset to Phase 01 for live interactive demo." });
    }
}
