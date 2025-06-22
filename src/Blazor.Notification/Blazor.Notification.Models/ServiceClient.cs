using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations.Schema;


namespace Blazor.Notification.Models;

/// <summary>
/// Модель клиента-пользователя сервиса Blazor.Notification.
/// </summary>
public class ServiceClient
{


  /// <summary>
  /// <para>Identity.</para>
  /// </summary>
  public int Id { get; set; }


  [NotMapped]
  public string Name => $"client #{(1000 + Id).ToString().Substring(1)}";

  /// <summary>
  /// <para>Дата и время последнего подключения этого клиента.</para>
  /// <para>Равно <see langword="null"/>, если клиент до сих пор подключен.</para>
  /// </summary>
  public DateTime? LastOnlineOn { get; set; }

  /// <summary>
  /// <para>Текущий статус сетевого подключения клиента.</para>
  /// </summary>
  public bool IsOnline => Connections?.Any(a => a.IsActive) ?? false;

  /// <summary>
  /// <para>Количество текущих активных подключений, открытых клиентом.</para>
  /// </summary>
  [NotMapped]
  public int ActiveConns => Connections?.Count(w => w.IsActive) ?? 0;


  public Connection ActiveConn => Connections?.FirstOrDefault(f => f.IsActive);

  public string ActiveConnCid => Connections?.FirstOrDefault(f => f.IsActive)?.Cid;

  /// <summary>
  /// <para>Список всех подключений (в том числе неактивных), открытых этим клиентом.</para>
  /// </summary>
  [JsonIgnore]
  public virtual List<Connection> Connections { get; set; } = [];

  /// <summary>
  /// Список отправленных этим клиентом сообщений.
  /// </summary>
  [JsonIgnore]
  public virtual List<Message> OutBox { get; set; } = [];

  /// <summary>
  /// Список входящих сообщений, адресованных этому клиенту.
  /// </summary>
  //[JsonIgnore]
  public virtual List<MessageToClient> InBox { get; set; } = [];

}