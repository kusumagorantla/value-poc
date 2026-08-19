using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Data
{
    public class JarvisDbContext : DbContext
    {
        public JarvisDbContext(DbContextOptions<JarvisDbContext> options) : base(options) { }

        public DbSet<ProcessFlow> ProcessFlows => Set<ProcessFlow>();
        public DbSet<ProcessStep> ProcessSteps => Set<ProcessStep>();
        public DbSet<ProcessOperation> ProcessOperations => Set<ProcessOperation>();
        public DbSet<ProcessResultDefinition> ProcessResultDefinitions => Set<ProcessResultDefinition>();
        public DbSet<StationStepMapping> StationStepMappings => Set<StationStepMapping>();
        public DbSet<ProcessResultRecord> ProcessResultRecords => Set<ProcessResultRecord>();
        public DbSet<ProcessResultValue> ProcessResultValues => Set<ProcessResultValue>();
        public DbSet<RecordingAuditLog> RecordingAuditLogs => Set<RecordingAuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProcessFlow>(entity =>
            {
                entity.ToTable("process_flows");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Steps)
                      .WithOne(e => e.Flow)
                      .HasForeignKey(e => e.FlowId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessStep>(entity =>
            {
                entity.ToTable("process_steps");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Operations)
                      .WithOne(e => e.Step)
                      .HasForeignKey(e => e.StepId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessOperation>(entity =>
            {
                entity.ToTable("process_operations");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.ResultDefinitions)
                      .WithOne(e => e.Operation)
                      .HasForeignKey(e => e.OperationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessResultDefinition>(entity =>
            {
                entity.ToTable("process_result_definitions");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<StationStepMapping>(entity =>
            {
                entity.ToTable("station_step_mappings");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<ProcessResultRecord>(entity =>
            {
                entity.ToTable("process_result_records");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Values)
                      .WithOne(e => e.Record)
                      .HasForeignKey(e => e.RecordId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessResultValue>(entity =>
            {
                entity.ToTable("process_result_values");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<RecordingAuditLog>(entity =>
            {
                entity.ToTable("recording_audit_logs");
                entity.HasKey(e => e.Id);
            });
        }
    }
}
