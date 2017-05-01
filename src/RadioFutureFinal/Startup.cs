using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RadioFutureFinal.Data;
using RadioFutureFinal.Models;
using RadioFutureFinal.Messaging;
using RadioFutureFinal.DAL;
using Microsoft.AspNetCore.Http;
using System.Reflection;

namespace RadioFutureFinal
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            services.AddSingleton(Configuration);
            services.AddSingleton<IDbRepository, DbRepository>();

            services.AddSingleton<MessageSenderFactory>();
            services.AddSingleton<IMyContext, MyContext>();
            services.AddSingleton<IMessageReceiverBase, MessageReceiverBase>();
            services.AddSingleton<IMessageReceiver, MessageReceiver>();
        }
        
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IServiceProvider serviceProvider, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();
            app.UseWebSockets();
            app.Map("/ws", (_app) => _app.UseMiddleware<WebSocketMiddleware>(serviceProvider.GetService<IMessageReceiverBase>()));

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

            routes.MapRoute(
                name: "room",
                template: "rooms/{*name}",
                defaults: new { controller = "Room", action = "EnterRoom" });
            });
        }

    }
}
