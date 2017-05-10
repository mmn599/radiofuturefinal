using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RadioFutureFinal.Models;

namespace RadioFutureFinal.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Session>().HasIndex(b => b.Name).IsUnique();
        }

        public DbSet<Session> Session { get; set; }

        public DbSet<Media> Media { get; set; }
    }
}
