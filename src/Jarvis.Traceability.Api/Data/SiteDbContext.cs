using Microsoft.EntityFrameworkCore;
using Jarvis.Traceability.Api.Models;

namespace Jarvis.Traceability.Api.Data
{
    /// <summary>
    /// Site Central Database Context (jarvis_site_db)
    /// Manages Master Process Flows, Steps, Operations, Result Definitions, and Central Station Mappings.
    /// </summary>
    public class SiteDbContext : DbContext
    {
        public SiteDbContext(DbContextOptions<SiteDbContext> options) : base(options) { }

        public DbSet<ProcessFlow> ProcessFlows => Set<ProcessFlow>();
        public DbSet<ProcessStep> ProcessSteps => Set<ProcessStep>();
        public DbSet<ProcessOperation> ProcessOperations => Set<ProcessOperation>();
        public DbSet<ProcessResultDefinition> ProcessResultDefinitions => Set<ProcessResultDefinition>();
        public DbSet<StationStepMapping> StationStepMappings => Set<StationStepMapping>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProcessFlow>(entity =>
            {
                entity.ToTable("site_process_flows");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Steps)
                      .WithOne(e => e.Flow)
                      .HasForeignKey(e => e.FlowId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessStep>(entity =>
            {
                entity.ToTable("site_process_steps");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.Operations)
                      .WithOne(e => e.Step)
                      .HasForeignKey(e => e.StepId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessOperation>(entity =>
            {
                entity.ToTable("site_process_operations");
                entity.HasKey(e => e.Id);
                entity.HasMany(e => e.ResultDefinitions)
                      .WithOne(e => e.Operation)
                      .HasForeignKey(e => e.OperationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ProcessResultDefinition>(entity =>
            {
                entity.ToTable("site_process_result_definitions");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<StationStepMapping>(entity =>
            {
                entity.ToTable("site_station_step_mappings");
                entity.HasKey(e => e.Id);
            });
        }
    }
}
