namespace Blazor.Notification.Models.Dtos;

/// <summary>
/// Модель клиента-пользователя, передаваемая на фронтенд.
/// </summary>
public class ServiceClientDto
{

  /// <summary>
  /// Identity.
  /// </summary>
  public int Id { get; set; }

  /// <summary>
  /// Отображаемое название клиента.
  /// </summary>
  public string Name { get; set; }

  /// <summary>
  /// Код текущего подключения клиента к хабу SignalR.
  /// </summary>
  public string Cid { get; set; }

  /// <summary>
  /// Код предыдущего подключения к хабу SignalR.
  /// </summary>
  public string PrevCid { get; set; }


  public bool IsSelected { get; set; }


  public bool IsCurrent { get; set; }


  public int UnreadCommonMsg { get; set; }


  public List<MessageDto> Messages { get; set; } = [];

}
