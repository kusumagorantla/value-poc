using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Services
{
    [SuppressMessage("Logging", "CA1848:Use the LoggerMessage delegates", Justification = "Background sync logger")]
    [SuppressMessage("Performance", "CA1873:Evaluation of this argument may be expensive", Justification = "Background sync logger")]
    [SuppressMessage("Performance", "CA1860:Prefer comparing Count to 0", Justification = "List count check")]
    public class SiteEdgeSyncBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SiteEdgeSyncBackgroundService> _logger;

        public SiteEdgeSyncBackgroundService(IServiceProvider serviceProvider, ILogger<SiteEdgeSyncBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SiteEdgeSyncBackgroundService started. Monitoring Site ↔ Edge dual database background sync loop (30s interval)...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await PerformBackgroundSyncAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during background Site ↔ Edge database synchronization cycle.");
                }

                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            _logger.LogInformation("SiteEdgeSyncBackgroundService stopping.");
        }

        private async Task PerformBackgroundSyncAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var siteDb = scope.ServiceProvider.GetRequiredService<SiteDbContext>();
            var edgeDb = scope.ServiceProvider.GetRequiredService<EdgeDbContext>();

            // Find Edge PC modified process flows needing background sync back to Site DB
            var modifiedEdgeFlows = await edgeDb.ProcessFlows
                .Include(f => f.Steps)
                .ThenInclude(s => s.Operations)
                .ThenInclude(o => o.ResultDefinitions)
                .Where(f => f.SyncStatus == "EDGE_MODIFIED" || f.SyncStatus == "PENDING_SYNC")
                .ToListAsync(ct);

            if (modifiedEdgeFlows.Count == 0)
            {
                return;
            }

            _logger.LogInformation("Background Sync: Found {Count} EDGE_MODIFIED flows requiring automatic sync back to Site Central DB.", modifiedEdgeFlows.Count);

            foreach (var edgeFlow in modifiedEdgeFlows)
            {
                var siteFlow = await siteDb.ProcessFlows
                    .FirstOrDefaultAsync(f => f.ProductId == edgeFlow.ProductId && f.FlowCode == edgeFlow.FlowCode, ct);

                if (siteFlow != null)
                {
                    // Reconcile Edge changes into Site Master DB
                    siteFlow.Description = edgeFlow.Description;
                    siteFlow.SyncStatus = "SYNCED";
                }

                edgeFlow.SyncStatus = "SYNCED";
            }

            await edgeDb.SaveChangesAsync(ct);
            await siteDb.SaveChangesAsync(ct);

            _logger.LogInformation("Background Sync Complete: Reconciled {Count} flows across Site DB & Edge DB.", modifiedEdgeFlows.Count);
        }
    }
}
