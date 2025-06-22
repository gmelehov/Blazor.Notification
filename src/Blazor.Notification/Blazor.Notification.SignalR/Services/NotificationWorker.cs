using Blazor.Notification.Services;
using Blazor.Notification.SignalR.Hubs;
using Microsoft.AspNetCore.SignalR;


namespace Blazor.Notification.SignalR.Services;


public class NotificationWorker(IServiceProvider serviceProvider) : BackgroundService
{
  private readonly IServiceProvider _sp = serviceProvider;





  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    using (var scope = _sp.CreateScope())
    {
      var hubContextService = scope.ServiceProvider.GetRequiredService<IHubContextService>();
      var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<BNHub>>();

      while (!stoppingToken.IsCancellationRequested)
      {
        try
        {
          var clientCids = await hubContextService.CreateBackgroundSystemMessage();
          await hubContext.Clients.Clients(clientCids).SendAsync("RequestClientsUpdate");
        }
        catch (Exception ex)
        {

        }

        await Task.Delay(10000);
      }

    }
  }


}
