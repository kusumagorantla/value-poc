using System.Diagnostics.CodeAnalysis;
using System.Threading.Channels;
using Jarvis.Traceability.Api.Data;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Services
{
    public interface IAuditLogChannelWriter
    {
        void QueueAuditLog(RecordingAuditLog log);
    }

    public class ChannelAuditLogger : BackgroundService, IAuditLogChannelWriter
    {
        private readonly Channel<RecordingAuditLog> _channel;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ChannelAuditLogger> _logger;

        public ChannelAuditLogger(IServiceProvider serviceProvider, ILogger<ChannelAuditLogger> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _channel = Channel.CreateUnbounded<RecordingAuditLog>(new UnboundedChannelOptions
            {
                SingleReader = true
            });
        }

        public void QueueAuditLog(RecordingAuditLog log)
        {
            _channel.Writer.TryWrite(log);
        }

        [SuppressMessage("Logging", "CA1848:Use the LoggerMessage delegates", Justification = "Background worker error logging")]
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (await _channel.Reader.WaitToReadAsync(stoppingToken))
            {
                while (_channel.Reader.TryRead(out var log))
                {
                    try
                    {
                        using var scope = _serviceProvider.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<JarvisDbContext>();
                        db.RecordingAuditLogs.Add(log);
                        await db.SaveChangesAsync(stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to persist background audit log snapshot.");
                    }
                }
            }
        }
    }
}
