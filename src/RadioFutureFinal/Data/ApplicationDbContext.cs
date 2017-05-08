using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RadioFutureFinal.Models;

namespace RadioFutureFinal.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Session>().HasIndex(b => b.Name).IsUnique();
            builder.Entity<MyUser>().HasMany(b => b.PriorSessions);

        }

        public DbSet<Session> Session { get; set; }

        public DbSet<MyUser> MyUser { get; set; }

        public DbSet<Media> Media { get; set; }
    }
}
