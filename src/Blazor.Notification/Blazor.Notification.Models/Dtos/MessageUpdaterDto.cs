using Blazor.Notification.Models.Enums;


namespace Blazor.Notification.Models.Dtos;

/// <summary>
/// Модель данных, передаваемая на фронтенд при обновлении сообщения.
/// </summary>
public class MessageUpdaterDto
{


  /// <summary>
  /// MessageToClient Identity.
  /// </summary>
  public int Id { get; set; }

  /// <summary>
  /// Статус сообщения.
  /// </summary>
  public MessageStatus Status { get; set; }

  /// <summary>
  /// Дата и время прочтения сообщения.
  /// </summary>
  public DateTime? ReadOn { get; set; }

}