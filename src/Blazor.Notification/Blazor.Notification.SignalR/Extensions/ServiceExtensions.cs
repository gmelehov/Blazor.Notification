using Blazor.Notification.Services;
using Blazor.Notification.SignalR.Data;
using Blazor.Notification.SignalR.Services;
using Microsoft.EntityFrameworkCore;


namespace Blazor.Notification.SignalR.Extensions;

/// <summary>
/// Методы расширения для коллекции сервисов.
/// </summary>
public static class ServiceExtensions
{





  public static IServiceCollection AddHubContextServices(this IServiceCollection scoll) =>
    scoll
    .AddDbContext<AppDbContext>(opts =>
    {
      opts.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=MyDatabase;Trusted_Connection=True;MultipleActiveResultSets=true");
      //opts.UseInMemoryDatabase("AppDatabase");
    })
    .AddScoped<IHubContextService, HubContextService>()
    ;




}