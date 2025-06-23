using Blazor.Notification.Models;
using Blazor.Notification.Models.Dtos;


namespace Blazor.Notification.Services;

/// <summary>
/// <para>Интерфейс вызова методов, выполняющихся на стороне клиента (в браузере).</para>
/// </summary>
public interface IHubClient
{



  /// <summary>
  /// <para>Извещает клиентский браузер о создании нового объекта клиентского подключения (<see cref="Connection"/>).</para>
  /// </summary>
  /// <param name="cid">Код текущего клиентского подключения.</param>
  /// <returns></returns>
  Task RcvConnectedEvent(string cid);

  /// <summary>
  /// Передает в клиентский браузер сведения о предыдущем клиентском подключении,
  /// инициирует запрос к серверу на передачу обновленного объекта клиентского подключения.
  /// </summary>
  /// <param name="cid">Код текущего клиентского подключения.</param>
  /// <param name="prevcid"></param>
  /// <returns></returns>
  Task RcvUpdatedPath(string cid, string prevcid);

  /// <summary>
  /// <para>Передает в клиентский браузер объект текущего клиентского подключения.</para>
  /// </summary>
  /// <param name="conn">Объект текущего клиентского подключения.</param>
  /// <returns></returns>
  Task RcvMyConnection(Connection conn);


  Task RcvMyClientDto(ServiceClientDto serviceClientDto);

  /// <summary>
  /// Передает список всех подключенных в настоящий момент клиентов.
  /// </summary>
  /// <param name="serviceClients">Список всех подключенных в настоящий момент клиентов.</param>
  /// <returns></returns>
  Task RcvActiveClients(IEnumerable<ServiceClientDto> serviceClients);

  /// <summary>
  /// <para>Извещает клиента/клиентов об обновлении сообщений.</para>
  /// </summary>
  /// <param name="messages">Список обновленных сообщений.</param>
  /// <returns></returns>
  Task RcvMessagesUpdateEvent(IEnumerable<MessageDto> messages);

  /// <summary>
  /// Инициирует на клиенте вызов серверного метода для получения обновленного списка
  /// активных клиентов, подключенных к хабу.
  /// </summary>
  /// <returns></returns>
  Task RequestClientsUpdate();

}
