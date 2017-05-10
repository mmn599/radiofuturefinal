using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RadioFutureFinal.DAL;
using RadioFutureFinal.Search;

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

            Searcher = new Searcher(Configuration);
            // TODO: probably smother way to do this
            Searcher.init().GetAwaiter().GetResult();
        }

        public IConfigurationRoot Configuration { get; }
        public Searcher Searcher { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            services.AddSingleton(Configuration);
            services.AddSingleton<IDbRepository, DbRepository>();

            services.AddSingleton(Searcher);
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

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "joinSession",
                    template: "session/JoinSession/{sessionName}", 
                    defaults: new { controller = "Session", action = "JoinSession" });

                routes.MapRoute(
                    name: "deleteMedia",
                    template: "session/DeleteMedia/{sessionId}/{mediaId}", 
                    defaults: new { controller = "Session", action = "DeleteMedia" });

                routes.MapRoute(
                    name: "addMedia",
                    template: "session/AddMedia/{sessionId}", 
                    defaults: new { controller = "Session", action = "AddMedia" });

                routes.MapRoute(
                    name: "search",
                    template: "session/Search", 
                    defaults: new { controller = "Session", action = "Search" });

                routes.MapRoute(
                    name: "lock",
                    template: "session/Lock/{sessionId}", 
                    defaults: new { controller = "Session", action = "Lock" });

                routes.MapRoute(
                    name: "room",
                    template: "playlists/{roomName}",
                    defaults: new { controller = "Room", action = "EnterRoom" });

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

    }
}
