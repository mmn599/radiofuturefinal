using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace RadioFutureFinal.Data
{
    public class DbContextFactory : IDbContextFactory<ApplicationDbContext>
    {

        private static IConfigurationRoot _configuration;

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
