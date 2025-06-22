using Blazor.Notification.SignalR.Data;
using Blazor.Notification.SignalR.Extensions;
using Blazor.Notification.SignalR.Hubs;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);



builder.Services.AddHubContextServices();


builder.Services
  .AddCors(o => {
    o.AddPolicy("AllowSetOrigins", options =>
    {
      options.WithOrigins("https://localhost:7211");
      options.AllowAnyHeader();
      options.AllowAnyMethod();
      options.AllowCredentials();
    });
  })
  .AddMvc()
  .AddNewtonsoftJson(opts =>
  {
    opts.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    opts.SerializerSettings.MaxDepth = 10;
    opts.UseMemberCasing();
  });

builder.Services.AddSignalR(opts =>
{
  opts.MaximumReceiveMessageSize = 1048576;
  opts.KeepAliveInterval = TimeSpan.FromSeconds(300);
  opts.ClientTimeoutInterval = TimeSpan.FromSeconds(300);
})
  .AddNewtonsoftJsonProtocol(opts =>
  {
    opts.PayloadSerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    opts.PayloadSerializerSettings.MaxDepth = 10;
    opts.PayloadSerializerSettings.Formatting = Formatting.None;
    opts.PayloadSerializerSettings.ContractResolver = new DefaultContractResolver() { NamingStrategy = null };
  });


var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowSetOrigins");

app.MapHub<BNHub>("/BNHub", conn =>
{
  conn.ApplicationMaxBufferSize = 2097152;
  conn.TransportMaxBufferSize = 2097152;
});



app.Lifetime.ApplicationStarted.Register(() =>
{
  using (var scope = app.Services.CreateScope())
  {
    var services = scope.ServiceProvider;
    var dbctx = services.GetRequiredService<AppDbContext>();
    dbctx.Connections.RemoveRange(dbctx.Connections.AsEnumerable().ToList());
    dbctx.MessageReceivers.RemoveRange(dbctx.MessageReceivers.AsEnumerable().ToList());
    dbctx.Messages.RemoveRange(dbctx.Messages.AsEnumerable().ToList());
    dbctx.ServiceClients.RemoveRange(dbctx.ServiceClients.AsEnumerable().ToList());
    dbctx.SaveChanges();
  }
});


app.Run();
