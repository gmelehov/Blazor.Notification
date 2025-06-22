using Blazor.Notification.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Blazor.Notification.Models;

/// <summary>
/// Модель сообщения, отправленного одному или нескольким клиентам-получателям.
/// </summary>
public class MessageToClient
{



  /// <summary>
  /// Identity
  /// </summary>
  [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Id { get; set; }

  /// <summary>
  /// Текущий статус сообщения.
  /// </summary>
  [Required, MaxLength(50)]
  public MessageStatus Status { get; set; }

  /// <summary>
  /// Дата и время прочтения сообщения.
  /// </summary>
  public DateTime? ReadOn { get; set; }

  /// <summary>
  /// Внешний ключ.
  /// </summary>
  public int MessageId { get; set; }

  /// <summary>
  /// Ссылка на отправленное сообщение.
  /// </summary>
  [ForeignKey("MessageId")]
  public virtual Message Message { get; set; }

  /// <summary>
  /// Внешний ключ.
  /// </summary>
  public int ReceiverId { get; set; }

  /// <summary>
  /// Ссылка на клиента-получателя сообщения.
  /// </summary>
  [ForeignKey("ReceiverId")]
  public virtual ServiceClient Receiver { get; set; }

}