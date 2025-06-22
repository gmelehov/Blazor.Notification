using Blazor.Notification.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace Blazor.Notification.Models;

/// <summary>
/// Модель сообщения.
/// </summary>
public class Message
{

  /// <summary>
  /// Identity
  /// </summary>
  [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  /// <summary>
  /// Дата и время создания сообщения.
  /// </summary>
  public DateTime CreatedOn { get; set; }

  /// <summary>
  /// Тип сообщения.
  /// </summary>
  [Required, MaxLength(20)]
  public MessageType Type { get; set; }

  /// <summary>
  /// Целевой чат для сообщения.
  /// </summary>
  [Required, MaxLength(20)]
  public MessageRoute MsgRoute { get; set; }

  /// <summary>
  /// Текст сообщения.
  /// </summary>
  [MaxLength(500)]
  public string Text { get; set; }

  /// <summary>
  /// Внешний ключ.
  /// Идентификатор клиента-отправителя.
  /// Если равно <see langword="null"/>, то отправитель этого сообщения - система.
  /// </summary>
  public int? SenderId { get; set; }

  /// <summary>
  /// Ссылка на клиента-отправителя этого сообщения.
  /// </summary>
  [ForeignKey("SenderId"), JsonIgnore]
  public virtual ServiceClient Sender { get; set; }

  /// <summary>
  /// Список клиентов-получателей отправленного сообщения.
  /// </summary>
  public virtual List<MessageToClient> Receivers { get; set; } = [];

}
