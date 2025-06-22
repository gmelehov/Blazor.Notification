using Blazor.Notification.Models;
using Blazor.Notification.Models.Dtos;
using Microsoft.AspNetCore.SignalR;


namespace Blazor.Notification.Services;

/// <summary>
/// <para>Интерфейс сервиса для работы с контекстом текущего клиентского соединения.</para>
/// </summary>
public interface IHubContextService
{


  /// <summary>
  /// <para>Возвращает объект текущего подключения.</para>
  /// <para>Если текущее подключение не найдено в репозитории, возвращает <see langword="null"/>.</para>
  /// </summary>
  /// <returns></returns>
  Connection GetCurrentConnection(HubCallerContext ctx);

  /// <summary>
  /// <para>Возвращает клиента, открывшего текущее подключение.</para>
  /// </summary>
  /// <returns></returns>
  ServiceClient GetCurrentCaller(HubCallerContext ctx);


  IEnumerable<ServiceClientDto> GetActiveClientDtos();


  ServiceClientDto GetCurrentClientDto(HubCallerContext ctx);


  Task<IEnumerable<string>> CreateBackgroundSystemMessage();

}
