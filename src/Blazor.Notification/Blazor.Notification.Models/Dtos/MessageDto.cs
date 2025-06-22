using Blazor.Notification.Models.Enums;


namespace Blazor.Notification.Models.Dtos;

/// <summary>
/// Модель сообщения, передаваемая на фронтенд.
/// </summary>
public class MessageDto
{

  /// <summary>
  /// MessageToClient Identity.
  /// </summary>
  public int Id { get; set; }

  /// <summary>
  /// Message Identity.
  /// </summary>
  public int MessageId { get; set; }

  /// <summary>
  /// Идентификатор клиента-отправителя.
  /// </summary>
  public int SenderId { get; set; }

  /// <summary>
  /// Идентификатор клиента-получателя.
  /// </summary>
  public int ReceiverId { get; set; }

  /// <summary>
  /// Код клиентского подключения клиента-получателя.
  /// </summary>
  public string ReceiverCid { get; set; }

  /// <summary>
  /// Отображаемое название клиента-получателя.
  /// </summary>
  public string ReceiverName { get; set; }

  /// <summary>
  /// Отображаемое название клиента-отправителя.
  /// </summary>
  public string SenderName { get; set; }

  /// <summary>
  /// Статус сообщения.
  /// </summary>
  public MessageStatus Status { get; set; }

  /// <summary>
  /// Целевой чат для сообщения.
  /// </summary>
  public MessageRoute MsgRoute { get; set; }

  /// <summary>
  /// Дата и время создания сообщения.
  /// </summary>
  public DateTime CreatedOn { get; set; }

  /// <summary>
  /// Дата и время прочтения сообщения.
  /// </summary>
  public DateTime? ReadOn { get; set; }

  /// <summary>
  /// Текст сообщения.
  /// </summary>
  public string Text { get; set; }

}
