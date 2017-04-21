using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RadioFutureFinal.Data
{
    public class DbContextFactory : IDbContextFactory<ApplicationDbContext>
    {
        IConfigurationRoot _configuration;
        
        // Only used for EF framework
        public DbContextFactory()
        {
            var directory = System.IO.Directory.GetCurrentDirectory() + "../../../..";
            var builder = new ConfigurationBuilder()
                .SetBasePath(directory)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
            builder.AddEnvironmentVariables();
            _configuration = builder.Build();
        }

        public DbContextFactory(IConfigurationRoot configuration)
        {
            _configuration = configuration;
        }

        public ApplicationDbContext Create(DbContextFactoryOptions options)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"));
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
