using Blazor.Notification.Client.Components;
using Blazor.Notification.Services;
using Newtonsoft.Json;
using Blazor.Notification.SignalR.Extensions;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddRazorComponents().AddInteractiveServerComponents();


builder.Services.AddCors().AddMvc().AddNewtonsoftJson(opts =>
{
  opts.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
  opts.SerializerSettings.MaxDepth = 2;
  opts.UseMemberCasing();
});


builder.Services.AddHubContextServices();

var app = builder.Build();


if (!app.Environment.IsDevelopment())
{
  app.UseExceptionHandler("/Error", createScopeForErrors: true);
  app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAntiforgery();
app.MapStaticAssets();

app.MapRazorComponents<App>()
   .AddInteractiveServerRenderMode(o => o.DisableWebSocketCompression = true)
    ;



app.Run();
