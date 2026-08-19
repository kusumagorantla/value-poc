using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Models;
using Jarvis.Traceability.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Non-Blocking Background Channel Audit Logger & Background Site-Edge Sync Worker
builder.Services.AddSingleton<ChannelAuditLogger>();
builder.Services.AddSingleton<IAuditLogChannelWriter>(sp => sp.GetRequiredService<ChannelAuditLogger>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<ChannelAuditLogger>());
builder.Services.AddHostedService<SiteEdgeSyncBackgroundService>();

// Configure CORS for React UI
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Configure Dual DbContexts (Site & Edge Databases)
var siteConn = builder.Configuration.GetConnectionString("SiteConnection") ?? builder.Configuration.GetConnectionString("DefaultConnection");
var edgeConn = builder.Configuration.GetConnectionString("EdgeConnection") ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(siteConn) || siteConn.Contains("InMemory"))
{
    builder.Services.AddDbContext<SiteDbContext>(options => options.UseInMemoryDatabase("JarvisSiteDb"));
    builder.Services.AddDbContext<EdgeDbContext>(options => options.UseInMemoryDatabase("JarvisEdgeDb"));
    builder.Services.AddDbContext<JarvisDbContext>(options => options.UseInMemoryDatabase("JarvisEdgeDb"));
}
else
{
    builder.Services.AddDbContext<SiteDbContext>(options => options.UseNpgsql(siteConn));
    builder.Services.AddDbContext<EdgeDbContext>(options => options.UseNpgsql(edgeConn));
    builder.Services.AddDbContext<JarvisDbContext>(options => options.UseNpgsql(edgeConn));
}

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Auto-seed sample BUC-0 data into both Site Central & Edge Line DBs
using (var scope = app.Services.CreateScope())
{
    var siteDb = scope.ServiceProvider.GetRequiredService<SiteDbContext>();
    var edgeDb = scope.ServiceProvider.GetRequiredService<EdgeDbContext>();
    var legacyDb = scope.ServiceProvider.GetRequiredService<JarvisDbContext>();

    siteDb.Database.EnsureCreated();
    edgeDb.Database.EnsureCreated();
    legacyDb.Database.EnsureCreated();

    if (!siteDb.ProcessFlows.Any())
    {
        var sampleStep1 = new ProcessStep
        {
            StepCode = 11001,
            StepName = "Housing Screwing",
            StepOrder = 1,
            Operations = new List<ProcessOperation>
            {
                new()
                {
                    OperationCode = 123021,
                    OperationName = "Screw 1",
                    ResultDefinitions = new List<ProcessResultDefinition>
                    {
                        new() { ResultCode = 50032, ResultName = "Angle", ResultType = 1, Uom = "DD", Nominal = 90, Lsl = 80, Usl = 100, IsMandatory = true },
                        new() { ResultCode = 50033, ResultName = "Torque", ResultType = 1, Uom = "NU", Nominal = 5, Lsl = 4.5m, Usl = 5.5m, IsMandatory = true }
                    }
                },
                new()
                {
                    OperationCode = 123022,
                    OperationName = "Screw 2",
                    ResultDefinitions = new List<ProcessResultDefinition>
                    {
                        new() { ResultCode = 50039, ResultName = "Angle", ResultType = 1, Uom = "DD", Nominal = 90, Lsl = 80, Usl = 100, IsMandatory = true },
                        new() { ResultCode = 50040, ResultName = "Torque", ResultType = 1, Uom = "NU", Nominal = 5, Lsl = 4.5m, Usl = 5.5m, IsMandatory = true }
                    }
                },
                new()
                {
                    OperationCode = 123023,
                    OperationName = "Screw 3",
                    ResultDefinitions = new List<ProcessResultDefinition>
                    {
                        new() { ResultCode = 50125, ResultName = "Angle", ResultType = 1, Uom = "DD", Nominal = 90, Lsl = 80, Usl = 100, IsMandatory = true },
                        new() { ResultCode = 50126, ResultName = "Torque", ResultType = 1, Uom = "NU", Nominal = 5, Lsl = 4.5m, Usl = 5.5m, IsMandatory = true }
                    }
                },
                new()
                {
                    OperationCode = 123024,
                    OperationName = "Screw 4",
                    ResultDefinitions = new List<ProcessResultDefinition>
                    {
                        new() { ResultCode = 50127, ResultName = "Angle", ResultType = 1, Uom = "DD", Nominal = 90, Lsl = 80, Usl = 100, IsMandatory = true },
                        new() { ResultCode = 50128, ResultName = "Torque", ResultType = 1, Uom = "NU", Nominal = 5, Lsl = 4.5m, Usl = 5.5m, IsMandatory = true },
                        new() { ResultCode = 50129, ResultName = "TextrR", ResultType = 2, Uom = "Text", IsMandatory = false }
                    }
                }
            }
        };

        var sampleStep2 = new ProcessStep { StepCode = 11002, StepName = "Body Sub Assembly 1", StepOrder = 2 };
        var sampleStep3 = new ProcessStep { StepCode = 11003, StepName = "Body Sub Assembly 2", StepOrder = 3 };
        var sampleStep4 = new ProcessStep { StepCode = 11004, StepName = "Assembly Gear", StepOrder = 4 };
        var sampleStep5 = new ProcessStep { StepCode = 11005, StepName = "Final Test", StepOrder = 5 };
        var sampleStep6 = new ProcessStep { StepCode = 11006, StepName = "Packing", StepOrder = 6 };

        var siteFlow = new ProcessFlow
        {
            ProductId = "MATERIAL-1",
            FlowCode = "FLOW1",
            Description = "Site Master Production Line 1 Flow (Annex 1 Benchmark)",
            SyncStatus = "SYNCED",
            Steps = new List<ProcessStep>
            {
                sampleStep1, sampleStep2, sampleStep3, sampleStep4, sampleStep5, sampleStep6
            }
        };

        siteDb.ProcessFlows.Add(siteFlow);
        siteDb.SaveChanges();

        // Seed Station Mappings (Site)
        siteDb.StationStepMappings.AddRange(
            new StationStepMapping { StepId = sampleStep1.Id, LineCode = "LINE-1", StationCode = "ST060.1" },
            new StationStepMapping { StepId = sampleStep1.Id, LineCode = "LINE-1", StationCode = "ST060.2" },
            new StationStepMapping { StepId = sampleStep2.Id, LineCode = "LINE-1", StationCode = "ST070" },
            new StationStepMapping { StepId = sampleStep3.Id, LineCode = "LINE-1", StationCode = "ST080" },
            new StationStepMapping { StepId = sampleStep4.Id, LineCode = "LINE-1", StationCode = "ST100" },
            new StationStepMapping { StepId = sampleStep5.Id, LineCode = "LINE-1", StationCode = "ST110" },
            new StationStepMapping { StepId = sampleStep6.Id, LineCode = "LINE-1", StationCode = "ST120" }
        );
        siteDb.SaveChanges();

        // Copy active flow to Edge DB
        var edgeStep1 = new ProcessStep
        {
            StepCode = 11001,
            StepName = "Housing Screwing",
            StepOrder = 1,
            Operations = new List<ProcessOperation>
            {
                new()
                {
                    OperationCode = 123021,
                    OperationName = "Screw 1",
                    ResultDefinitions = new List<ProcessResultDefinition>
                    {
                        new() { ResultCode = 50032, ResultName = "Angle", ResultType = 1, Uom = "DD", Nominal = 90, Lsl = 80, Usl = 100, IsMandatory = true },
                        new() { ResultCode = 50033, ResultName = "Torque", ResultType = 1, Uom = "NU", Nominal = 5, Lsl = 4.5m, Usl = 5.5m, IsMandatory = true }
                    }
                }
            }
        };

        var edgeFlow = new ProcessFlow
        {
            ProductId = "MATERIAL-1",
            FlowCode = "FLOW1",
            Description = "Active Edge Line 1 Flow (Synced from Site)",
            SyncStatus = "SYNCED",
            Steps = new List<ProcessStep> { edgeStep1 }
        };

        edgeDb.ProcessFlows.Add(edgeFlow);
        edgeDb.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/healthz");

app.Run();
