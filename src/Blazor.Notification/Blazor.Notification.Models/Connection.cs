using Blazor.Notification.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace Blazor.Notification.Models;

/// <summary>
/// Модель клиентского подключения к сервису.
/// </summary>
public class Connection
{



  /// <summary>
  /// 
  /// </summary>
  /// <param name="path"></param>
  /// <returns></returns>
  public Connection UpdateInfo(string path = null)
  {
    if (IsActive && ClosedOn == null)
    {
      Path = path;
    };
    return this;
  }

  /// <summary>
  /// <para>Обновляет данные о предыдущем клиентском подключении.</para>
  /// </summary>
  /// <param name="prevconnId">Идентификатор предыдущего клиентского подключения.</param>
  /// <returns></returns>
  public Connection UpdatePrevConn(int? prevconnId)
  {
    if (PrevId == null && prevconnId != null)
    {
      PrevId = prevconnId;
    }
    ;
    return this;
  }

  /// <summary>
  /// <para>Помечает клиентское подключение как закрытое (неактивное).</para>
  /// </summary>
  /// <returns></returns>
  public Connection Close()
  {
    if (ClosedOn == null && IsActive)
    {
      ClosedOn = DateTime.Now;
      IsActive = false;
    }

    return this;
  }





  /// <summary>
  /// <para>Identity.</para>
  /// </summary>
  public virtual int Id { get; set; }

  /// <summary>
  /// <para>Код подключения, сгенерированный библиотекой SignalR.</para>
  /// </summary>
  public string Cid { get; set; }

  /// <summary>
  /// <para>Адрес страницы в клиентском браузере.</para>
  /// </summary>
  public string Path { get; set; }

  /// <summary>
  /// <para>IP-адрес клиентского подключения.</para>
  /// </summary>
  public string IP { get; set; }

  /// <summary>
  /// <para>Момент открытия подключения.</para>
  /// </summary>
  public DateTime StartedOn { get; set; }

  /// <summary>
  /// <para>Момент закрытия подключения.</para>
  /// <para>Если равно <see langword="null"/>, то это подключение - активно.</para>
  /// </summary>
  public DateTime? ClosedOn { get; set; }

  /// <summary>
  /// <para>Признак активного (открытого в данный момент времени) подключения.</para>
  /// <para>После закрытия подключения устанавливается значение <see langword="false"/>.</para>
  /// </summary>
  public bool IsActive { get; set; } = true;

  /// <summary>
  /// <para>Причина открытия этого подключения.</para>
  /// </summary>
  public ConnectReason ConnectReason { get; set; }

  /// <summary>
  /// <para>Причина закрытия этого подключения.</para>
  /// </summary>
  public DisconnectReason DisconnectReason { get; set; }

  /// <summary>
  /// Идентификатор предыдущего подключения.
  /// </summary>
  [NotMapped]
  public string PrevCid => Previous?.Cid;

  /// <summary>
  /// <para>Внешний ключ.</para>
  /// </summary>
  public virtual int? PrevId { get; set; }

  /// <summary>
  /// <para>Ссылка на предыдущее подключение.</para>
  /// </summary>
  [JsonIgnore]
  public virtual Connection Previous { get; set; }

  /// <summary>
  /// Внешний ключ.
  /// </summary>
  public virtual int? CallerId { get; set; }

  /// <summary>
  /// Ссылка на клиента, открывшего это подключение.
  /// </summary>
  public virtual ServiceClient Caller { get; set; }

}
