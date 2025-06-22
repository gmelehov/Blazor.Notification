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
  /// <param name="pathname">НЕ ИСПОЛЬЗУЕТСЯ</param>
  /// <param name="useragent">НЕ ИСПОЛЬЗУЕТСЯ</param>
  /// <param name="prevcid">НЕ ИСПОЛЬЗУЕТСЯ</param>
  /// <returns></returns>
  Task RcvUpdatedPath(string cid, string prevcid);

  /// <summary>
  /// <para>
  /// Передает в клиентский браузер код текущего клиентского подключения,
  /// инициирует его запись в браузерный Session Storage.
  /// </para>
  /// </summary>
  /// <param name="cid">Код текущего клиентского подключения.</param>
  /// <returns></returns>
  Task EnsureActualCid(string cid);

  /// <summary>
  /// <para>Передает в клиентский браузер объект текущего клиентского подключения.</para>
  /// </summary>
  /// <param name="conn">Объект текущего клиентского подключения.</param>
  /// <returns></returns>
  Task RcvMyConnection(Connection conn);


  Task RcvMyClientDto(ServiceClientDto serviceClientDto);

  /// <summary>
  /// <para>Передает в клиентский браузер объект текущего клиентского подключения.</para>
  /// </summary>
  /// <param name="conn">Объект текущего клиентского подключения.</param>
  /// <returns></returns>
  Task UpdMyConnection(Connection conn);

  /// <summary>
  /// Удаляет сведения об отключившемся клиенте из общего чата во всех клиентских браузерах.
  /// </summary>
  /// <param name="cid">Код текущего клиентского подключения.</param>
  /// <param name="clientId">Идентификатор клиента.</param>
  /// <returns></returns>
  Task RemConnectedClient(string cid, int clientId);

  /// <summary>
  /// Передает сведения о подключившемся клиенте в общие чаты во все клиентские браузеры.
  /// </summary>
  /// <param name="cid">Код текущего клиентского подключения.</param>
  /// <param name="serviceClient">Клиент.</param>
  /// <returns></returns>
  Task AddConnectedClient(string cid, ServiceClient serviceClient);

  /// <summary>
  /// Передает список всех подключенных в настоящий момент клиентов.
  /// </summary>
  /// <param name="serviceClients">Список всех подключенных в настоящий момент клиентов.</param>
  /// <returns></returns>
  Task RcvActiveClients(IEnumerable<ServiceClientDto> serviceClients);

  /// <summary>
  /// Передает список сообщений клиента.
  /// </summary>
  /// <param name="messages"></param>
  /// <returns></returns>
  Task RcvClientMessages(IEnumerable<MessageDto> messages);

  /// <summary>
  /// Передает системное сообщение.
  /// </summary>
  /// <param name="message"></param>
  /// <returns></returns>
  Task RcvSystemMessage(MessageDto message);

  /// <summary>
  /// <para>Извещает клиента/клиентов об обновлении сообщений, отправленных указанным клиентом.</para>
  /// </summary>
  /// <param name="senderId">Идентификатор клиента-отправителя обновленных сообщений.</param>
  /// <returns></returns>
  Task RcvMessagesUpdateEvent(IEnumerable<MessageDto> messages);


  Task RcvClientUpdate(ServiceClientDto serviceClient);

  /// <summary>
  /// Инициирует на клиенте вызов серверного метода для получения обновленного списка
  /// активных клиентов, подключенных к хабу.
  /// </summary>
  /// <returns></returns>
  Task RequestClientsUpdate();



}
