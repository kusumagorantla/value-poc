using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Jarvis.Traceability.Api.Data
{
    /// <summary>
    /// Design-time factory for Site Central Database EF Core Migrations (jarvis_site_db)
    /// </summary>
    public class SiteDbContextFactory : IDesignTimeDbContextFactory<SiteDbContext>
    {
        public SiteDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<SiteDbContext>();
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=jarvis_site_db;Username=postgres;Password=postgres");
            return new SiteDbContext(optionsBuilder.Options);
        }
    }

    /// <summary>
    /// Design-time factory for Edge Line Database EF Core Migrations (jarvis_edge_db)
    /// </summary>
    public class EdgeDbContextFactory : IDesignTimeDbContextFactory<EdgeDbContext>
    {
        public EdgeDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<EdgeDbContext>();
            optionsBuilder.UseNpgsql("Host=localhost;Port=5433;Database=jarvis_edge_db;Username=postgres;Password=postgres");
            return new EdgeDbContext(optionsBuilder.Options);
        }
    }
}
